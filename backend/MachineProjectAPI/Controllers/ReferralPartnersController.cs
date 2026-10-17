using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;

namespace MachineProjectAPI.Controllers
{
    /// <summary>
    /// Tea vendors, building contractors, supervisors and field staff who refer
    /// leads to us and get paid a commission when a deal matures. Admin only.
    /// </summary>
    [ApiController]
    [Route("api/referral-partners")]
    [Authorize]
    public class ReferralPartnersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReferralPartnersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<ReferralPartnerDto>>> GetPartners([FromQuery] bool includeInactive = false)
        {
            var query = _context.ReferralPartners.AsQueryable();
            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            var partners = await query.OrderByDescending(p => p.DateAdded).ToListAsync();
            return Ok(partners.Select(ToDto).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<ReferralPartnerDto>> CreatePartner([FromBody] ReferralPartnerRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || !ReferralPartnerTypes.All.Contains(request.PartnerType))
            {
                return BadRequest(new { message = "Name and a valid partner type are required." });
            }

            var partner = new ReferralPartner
            {
                Name = request.Name,
                PartnerType = request.PartnerType,
                Email = request.Email,
                Phone = request.Phone,
                WhatsApp = request.WhatsApp,
                Location = request.Location,
                Description = request.Description,
                CommissionPercentage = request.CommissionPercentage,
                CommissionType = string.IsNullOrWhiteSpace(request.CommissionType) ? "Percentage" : request.CommissionType,
            };

            _context.ReferralPartners.Add(partner);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPartners), new { }, ToDto(partner));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ReferralPartnerDto>> UpdatePartner(int id, [FromBody] ReferralPartnerRequest request)
        {
            var partner = await _context.ReferralPartners.FirstOrDefaultAsync(p => p.Id == id);
            if (partner == null) return NotFound(new { message = "Referral partner not found." });

            partner.Name = request.Name;
            partner.PartnerType = request.PartnerType;
            partner.Email = request.Email;
            partner.Phone = request.Phone;
            partner.WhatsApp = request.WhatsApp;
            partner.Location = request.Location;
            partner.Description = request.Description;
            partner.CommissionPercentage = request.CommissionPercentage;
            partner.CommissionType = string.IsNullOrWhiteSpace(request.CommissionType) ? partner.CommissionType : request.CommissionType;

            await _context.SaveChangesAsync();
            return Ok(ToDto(partner));
        }

        /// <summary>
        /// Record a commission payout to this partner (e.g. after paying them in cash/UPI
        /// once a deal matures). Reduces the amount shown as owed.
        /// POST /api/referral-partners/{id}/record-payment
        /// </summary>
        [HttpPost("{id:int}/record-payment")]
        public async Task<ActionResult<ReferralPartnerDto>> RecordPayment(int id, [FromBody] RecordPaymentRequest request)
        {
            if (request.Amount <= 0)
            {
                return BadRequest(new { message = "Payment amount must be greater than zero." });
            }

            var partner = await _context.ReferralPartners.FirstOrDefaultAsync(p => p.Id == id);
            if (partner == null) return NotFound(new { message = "Referral partner not found." });

            partner.TotalCommissionPaid += request.Amount;
            partner.LastActive = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ToDto(partner));
        }

        /// <summary>
        /// Deactivate a referral partner (soft delete — their lead history stays intact).
        /// DELETE /api/referral-partners/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeactivatePartner(int id)
        {
            var partner = await _context.ReferralPartners.FirstOrDefaultAsync(p => p.Id == id);
            if (partner == null) return NotFound(new { message = "Referral partner not found." });

            partner.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static ReferralPartnerDto ToDto(ReferralPartner p) => new ReferralPartnerDto
        {
            Id = p.Id,
            Name = p.Name,
            PartnerType = p.PartnerType,
            Email = p.Email,
            Phone = p.Phone,
            WhatsApp = p.WhatsApp,
            Location = p.Location,
            Description = p.Description,
            CommissionPercentage = p.CommissionPercentage,
            CommissionType = p.CommissionType,
            IsActive = p.IsActive,
            DateAdded = p.DateAdded,
            LastActive = p.LastActive,
            LeadsProvided = p.LeadsProvided,
            DealsMatured = p.DealsMatured,
            TotalCommissionEarned = p.TotalCommissionEarned,
            TotalCommissionPaid = p.TotalCommissionPaid,
        };
    }
}
