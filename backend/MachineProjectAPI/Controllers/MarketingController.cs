using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MachineProjectAPI.Controllers
{
    [ApiController]
    [Route("api/marketing")]
    [Authorize]
    public class MarketingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MarketingController(ApplicationDbContext context) => _context = context;

        public class MarketingPostRequest
        {
            public int MachineId { get; set; }
            public List<string> Channels { get; set; } = new();
            public DateTime? PostedOn { get; set; }
            public string? Notes { get; set; }
        }

        /// <summary>GET /api/marketing/channels — the channel list the tracker uses.</summary>
        [HttpGet("channels")]
        public ActionResult<List<string>> Channels() => MarketingChannels.All;

        /// <summary>GET /api/marketing?from=&amp;to= — logged posts, newest first (default: last 30 days).</summary>
        [HttpGet]
        public async Task<IActionResult> List([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int? machineId)
        {
            var start = (from ?? DateTime.UtcNow.AddDays(-30)).Date;
            var end = (to ?? DateTime.UtcNow).Date.AddDays(1);
            var query = _context.MarketingPosts.Where(p => p.IsActive && p.PostedOn >= start && p.PostedOn < end);
            if (machineId.HasValue) query = query.Where(p => p.MachineId == machineId.Value);

            var posts = await query.OrderByDescending(p => p.PostedOn).ThenByDescending(p => p.Id)
                .Select(p => new { p.Id, p.MachineId, p.Channel, p.PostedOn, p.Notes, by = p.CreatedByName })
                .ToListAsync();
            return Ok(posts);
        }

        /// <summary>POST /api/marketing — log one post per selected channel.</summary>
        [HttpPost]
        public async Task<IActionResult> Log([FromBody] MarketingPostRequest request)
        {
            var channels = request.Channels.Select(c => MarketingChannels.All.FirstOrDefault(a => string.Equals(a, c?.Trim(), StringComparison.OrdinalIgnoreCase)))
                .Where(c => c != null).Distinct().ToList();
            if (channels.Count == 0) return BadRequest(new { message = "Choose at least one channel." });
            if (!await _context.Machines.AnyAsync(m => m.Id == request.MachineId && m.IsActive))
                return NotFound(new { message = "Machine not found." });

            var day = (request.PostedOn ?? DateTime.UtcNow).Date;
            if (day > DateTime.UtcNow.Date.AddDays(1)) return BadRequest(new { message = "The date can't be in the future." });
            var by = User.FindFirst("fullName")?.Value ?? string.Empty;

            foreach (var channel in channels)
            {
                _context.MarketingPosts.Add(new MarketingPost
                {
                    MachineId = request.MachineId,
                    Channel = channel!,
                    PostedOn = day,
                    Notes = request.Notes?.Trim() ?? string.Empty,
                    CreatedByName = by,
                });
            }
            await _context.SaveChangesAsync();
            return Ok(new { added = channels.Count });
        }

        /// <summary>DELETE /api/marketing/{id} — undo a wrongly logged post.</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Remove(int id)
        {
            var post = await _context.MarketingPosts.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
            if (post == null) return NotFound();
            post.IsActive = false;
            post.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
