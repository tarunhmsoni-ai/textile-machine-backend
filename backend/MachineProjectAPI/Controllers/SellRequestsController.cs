using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using MachineProjectAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MachineProjectAPI.Controllers
{
    // A visitor offers a machine for sale. It is saved as "Received" (step 1 of the machine
    // pipeline) and never appears on the website until staff move it all the way to Live.
    [ApiController]
    [Route("api/sell")]
    public class SellRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _email;

        private readonly TokenService _tokens;
        private readonly Microsoft.AspNetCore.Identity.PasswordHasher<User> _hasher = new();

        public SellRequestsController(ApplicationDbContext context, IEmailService email, TokenService tokens)
        {
            _context = context;
            _email = email;
            _tokens = tokens;
        }

        public class SignUpRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string? Website { get; set; } // honeypot
        }

        /// <summary>POST /api/sell/register — a visitor creates a seller account (phone number is the username).</summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] SignUpRequest request)
        {
            if (!string.IsNullOrWhiteSpace(request.Website)) return BadRequest(new { message = "Could not create the account." });

            var name = Clip(request.FullName, 100);
            var phone = new string(Clip(request.Phone, 20).Where(c => char.IsDigit(c) || c == '+').ToArray());
            if (name.Length == 0 || phone.Length < 8)
                return BadRequest(new { message = "Please enter your name and a valid phone number." });
            if ((request.Password ?? string.Empty).Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters." });

            var since = DateTime.UtcNow.AddHours(-1);
            if (await _context.Users.CountAsync(u => u.Role == UserRoles.Seller && u.CreatedAt > since) >= 20)
                return StatusCode(429, new { message = "Too many sign-ups right now. Please call us instead." });
            if (await _context.Users.AnyAsync(u => u.Username == phone))
                return Conflict(new { message = "This phone number already has an account. Please log in." });

            var user = new User { FullName = name, Username = phone, Role = UserRoles.Seller };
            user.PasswordHash = _hasher.HashPassword(user, request.Password!);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var (token, expiresAt) = _tokens.GenerateToken(user);
            return Ok(new { token, expiresAt, fullName = user.FullName, username = user.Username, role = user.Role });
        }

        /// <summary>GET /api/sell/mine — the signed-in seller's machines and where they are in our checks.</summary>
        [HttpGet("mine")]
        [Authorize(Roles = UserRoles.Seller)]
        public async Task<IActionResult> Mine()
        {
            var uid = SellerId();
            var mine = await _context.Machines.Where(m => m.IsActive && m.PostedByUserId == uid)
                .OrderByDescending(m => m.DatePosted)
                .Select(m => new { id = m.Id, type = m.Type, brand = m.Brand, model = m.Model, status = m.Status, datePosted = m.DatePosted })
                .ToListAsync();
            return Ok(mine);
        }

        private int? SellerId()
        {
            if (!User.IsInRole(UserRoles.Seller)) return null;
            var claim = User.FindFirst("sub") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
        }

        public class SellRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string? Email { get; set; }
            public string Type { get; set; } = string.Empty;
            public string? Brand { get; set; }
            public string? Model { get; set; }
            public int? Year { get; set; }
            public string? Location { get; set; }
            public decimal? AskingPrice { get; set; }
            public string? Description { get; set; }
            public string? Website { get; set; } // honeypot: real visitors leave it empty
        }

        private static string Clip(string? s, int max)
        {
            var t = (s ?? string.Empty).Trim();
            return t.Length > max ? t[..max] : t;
        }

        /// <summary>POST /api/sell — public "I have a machine to sell" form.</summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Submit([FromBody] SellRequest request)
        {
            if (!string.IsNullOrWhiteSpace(request.Website)) return Ok(new { message = "Thank you." }); // bot: pretend success

            var name = Clip(request.Name, 100);
            var phone = new string(Clip(request.Phone, 20).Where(c => char.IsDigit(c) || c == '+').ToArray());
            var type = MachineTypes.All.FirstOrDefault(t => string.Equals(t, request.Type?.Trim(), StringComparison.OrdinalIgnoreCase));
            if (name.Length == 0 || phone.Length < 8)
                return BadRequest(new { message = "Please enter your name and a valid phone number." });
            if (type == null)
                return BadRequest(new { message = "Please choose the machine type." });

            var since = DateTime.UtcNow.AddHours(-1);
            if (await _context.Machines.CountAsync(m => (m.PostedByUserId == null || m.PostedByUser!.Role == UserRoles.Seller) && m.DatePosted > since) >= 20)
                return StatusCode(429, new { message = "Too many requests right now. Please call us instead." });

            var machine = new Machine
            {
                Type = type,
                Brand = Clip(request.Brand, 100),
                Model = Clip(request.Model, 100),
                Year = request.Year is > 1900 and < 2100 ? request.Year.Value : 0,
                Location = Clip(request.Location, 150),
                AskingPrice = request.AskingPrice is > 0 ? request.AskingPrice.Value : 0,
                Description = Clip(request.Description, 2000),
                SellerName = name,
                SellerPhone = phone,
                SellerEmail = Clip(request.Email, 150),
                Status = "Received",
                PostedByUserId = SellerId(),
            };
            _context.Machines.Add(machine);
            _context.MachineStageLogs.Add(new MachineStageLog { Machine = machine, ToStatus = "Received", ByName = "Website visitor" });
            await _context.SaveChangesAsync();

            await _email.SendToOwnerAsync(
                $"New machine offered for sale: {type} {machine.Brand} {machine.Model}".Trim(),
                string.Join(Environment.NewLine, new[]
                {
                    $"Seller: {name}", $"Phone: {phone}", $"Email: {machine.SellerEmail}",
                    $"Machine: {type} {machine.Brand} {machine.Model} ({(machine.Year > 0 ? machine.Year.ToString() : "year not given")})",
                    $"Location: {machine.Location}", $"Details: {machine.Description}",
                    "It is saved as 'Received' in Machine Inventory.",
                }));

            return Ok(new { message = "Thank you. We will contact you shortly." });
        }
    }
}
