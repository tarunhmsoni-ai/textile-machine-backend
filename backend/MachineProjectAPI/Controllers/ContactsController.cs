using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;

namespace MachineProjectAPI.Controllers
{
    /// <summary>
    /// Simple registries for Customers, Machine Dealers and Masters — the three
    /// "Number of X Added" KPIs from the client's KPI doc. Admin/staff only.
    /// </summary>
    [ApiController]
    [Route("api/contacts")]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<ContactDto>>> GetContacts([FromQuery] string? type)
        {
            var query = _context.Contacts.Where(c => c.IsActive).AsQueryable();
            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(c => c.ContactType == type);
            }

            var contacts = await query.OrderByDescending(c => c.DateAdded).ToListAsync();
            return Ok(contacts.Select(ToDto).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<ContactDto>> CreateContact([FromBody] ContactRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || !ContactTypes.All.Contains(request.ContactType))
            {
                return BadRequest(new { message = "Name and a valid contact type (Customer, Dealer, Master) are required." });
            }

            var contact = new Contact
            {
                ContactType = request.ContactType,
                Name = request.Name,
                Phone = request.Phone,
                Email = request.Email,
                Location = request.Location,
                Notes = request.Notes,
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContacts), new { }, ToDto(contact));
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteContact(int id)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
            if (contact == null) return NotFound(new { message = "Contact not found." });

            contact.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static ContactDto ToDto(Contact c) => new ContactDto
        {
            Id = c.Id,
            ContactType = c.ContactType,
            Name = c.Name,
            Phone = c.Phone,
            Email = c.Email,
            Location = c.Location,
            Notes = c.Notes,
            DateAdded = c.DateAdded,
        };
    }
}
