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

        public SellRequestsController(ApplicationDbContext context, IEmailService email)
        {
            _context = context;
            _email = email;
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
            if (await _context.Machines.CountAsync(m => m.PostedByUserId == null && m.DatePosted > since) >= 20)
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
            };
            _context.Machines.Add(machine);
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
