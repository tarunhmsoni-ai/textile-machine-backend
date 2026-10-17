using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;

namespace MachineProjectAPI.Controllers
{
    /// <summary>
    /// The office IP whitelist that Staff-role logins are restricted to. Admin-only.
    /// </summary>
    [ApiController]
    [Route("api/staff-access")]
    [Authorize(Roles = UserRoles.Admin)]
    public class StaffAccessController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StaffAccessController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("ips")]
        public async Task<ActionResult<List<StaffAccessIp>>> GetIps()
        {
            var ips = await _context.StaffAccessIps.OrderByDescending(i => i.DateAdded).ToListAsync();
            return Ok(ips);
        }

        [HttpPost("ips")]
        public async Task<ActionResult<StaffAccessIp>> AddIp([FromBody] StaffAccessIpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.IpAddress))
            {
                return BadRequest(new { message = "An IP address is required." });
            }

            var ip = request.IpAddress.Trim();
            var exists = await _context.StaffAccessIps.AnyAsync(i => i.IpAddress == ip);
            if (exists)
            {
                return Conflict(new { message = "This IP is already whitelisted." });
            }

            var entry = new StaffAccessIp { IpAddress = ip, Label = request.Label?.Trim() ?? string.Empty };
            _context.StaffAccessIps.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(entry);
        }

        [HttpDelete("ips/{id:int}")]
        public async Task<ActionResult> RemoveIp(int id)
        {
            var entry = await _context.StaffAccessIps.FindAsync(id);
            if (entry == null) return NotFound(new { message = "Whitelist entry not found." });

            _context.StaffAccessIps.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class StaffAccessIpRequest
    {
        public string IpAddress { get; set; } = string.Empty;
        public string? Label { get; set; }
    }
}
