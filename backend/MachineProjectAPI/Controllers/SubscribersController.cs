using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using MachineProjectAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MachineProjectAPI.Controllers
{
    [ApiController]
    [Route("api/subscribers")]
    public class SubscribersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _email;

        public SubscribersController(ApplicationDbContext context, IEmailService email)
        {
            _context = context;
            _email = email;
        }

        public class SubscribeRequest
        {
            public string? Email { get; set; }
            public string? WhatsApp { get; set; }
        }

        /// <summary>POST /api/subscribers — public "special offers" sign-up (email and/or WhatsApp).</summary>
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Subscribe([FromBody] SubscribeRequest request)
        {
            var email = (request.Email ?? string.Empty).Trim();
            var whatsApp = new string((request.WhatsApp ?? string.Empty).Where(c => char.IsDigit(c) || c == '+').ToArray());

            if (email.Length == 0 && whatsApp.Length == 0)
            {
                return BadRequest(new { message = "Please enter your email or WhatsApp number." });
            }
            if (email.Length > 0 && (email.Length > 200 || !email.Contains('@') || !email.Contains('.')))
            {
                return BadRequest(new { message = "Please enter a valid email address." });
            }
            if (whatsApp.Length > 0 && (whatsApp.Length < 8 || whatsApp.Length > 20))
            {
                return BadRequest(new { message = "Please enter a valid WhatsApp number." });
            }

            var normalizedEmail = email.ToLowerInvariant();
            var exists = await _context.Subscribers.AnyAsync(s => s.IsActive
                && ((normalizedEmail != "" && s.Email == normalizedEmail) || (whatsApp != "" && s.WhatsApp == whatsApp)));

            if (!exists)
            {
                _context.Subscribers.Add(new Subscriber { Email = normalizedEmail, WhatsApp = whatsApp });
                await _context.SaveChangesAsync();
                await _email.SendToOwnerAsync("New website subscriber",
                    $"Someone asked for special offers.\nEmail: {(normalizedEmail == "" ? "-" : normalizedEmail)}\nWhatsApp: {(whatsApp == "" ? "-" : whatsApp)}");
            }

            return Ok(new { message = "You're subscribed — thank you." });
        }

        /// <summary>GET /api/subscribers — admin only list for the dashboard.</summary>
        [HttpGet]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> List()
        {
            var items = await _context.Subscribers
                .Where(s => s.IsActive)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new { s.Id, s.Email, s.WhatsApp, s.Source, DateAdded = s.CreatedAt })
                .ToListAsync();
            return Ok(items);
        }

        /// <summary>DELETE /api/subscribers/{id} — admin removes a subscriber.</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> Remove(int id)
        {
            var s = await _context.Subscribers.FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            if (s == null) return NotFound(new { message = "Subscriber not found." });
            s.IsActive = false;
            s.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
