using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;

namespace MachineProjectAPI.Controllers
{
    [ApiController]
    [Route("api/leads")]
    [Authorize]
    public class LeadsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LeadsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// List leads for the admin Pipeline page. Admin/staff only.
        /// GET /api/leads?status=&source=
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<LeadDto>>> GetLeads([FromQuery] string? status, [FromQuery] string? source)
        {
            var query = _context.Leads.Where(l => l.IsActive).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(l => l.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(source))
            {
                query = query.Where(l => l.Source == source);
            }

            var leads = await query
                .Include(l => l.MatchedMachine)
                .Include(l => l.ReferralPartner)
                .OrderByDescending(l => l.DateReceived)
                .ToListAsync();

            return Ok(leads.Select(l => ToDto(l)).ToList());
        }

        /// <summary>
        /// Single lead with its activity history.
        /// GET /api/leads/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<LeadDto>> GetLead(int id)
        {
            var lead = await _context.Leads
                .Include(l => l.MatchedMachine)
                .Include(l => l.ReferralPartner)
                .Include(l => l.Activities)
                .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);

            if (lead == null) return NotFound(new { message = "Lead not found." });

            return Ok(ToDto(lead, includeActivities: true));
        }

        /// <summary>
        /// Create a lead from the admin panel (e.g. a phone/WhatsApp enquiry staff logs manually).
        /// POST /api/leads
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<LeadDto>> CreateLead([FromBody] LeadRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) && string.IsNullOrWhiteSpace(request.Phone))
            {
                return BadRequest(new { message = "Name or phone is required." });
            }

            var lead = new Lead
            {
                Source = string.IsNullOrWhiteSpace(request.Source) ? "Website" : request.Source,
                SourceDetails = request.SourceDetails,
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                WhatsApp = request.WhatsApp,
                RequiredMachineType = request.RequiredMachineType,
                RequiredSubType = request.RequiredSubType,
                RequiredBrand = request.RequiredBrand,
                RequiredModel = request.RequiredModel,
                AdditionalRequirements = request.AdditionalRequirements,
                BudgetMin = request.BudgetMin,
                BudgetMax = request.BudgetMax,
                PreferredLocation = request.PreferredLocation,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "New" : request.Status,
                MatchedMachineId = request.MatchedMachineId,
                Notes = request.Notes ?? string.Empty,
                ReferralPartnerId = request.ReferralPartnerId,
            };

            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();

            if (lead.ReferralPartnerId.HasValue)
            {
                var partner = await _context.ReferralPartners.FindAsync(lead.ReferralPartnerId.Value);
                if (partner != null)
                {
                    partner.LeadsProvided += 1;
                    partner.LastActive = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, ToDto(lead));
        }

        /// <summary>
        /// Public enquiry form on the website (machine-detail contact form, homepage contact form).
        /// No login required — this is how buyer interest actually enters the pipeline.
        /// POST /api/leads/public
        /// </summary>
        [HttpPost("public")]
        [AllowAnonymous]
        public async Task<ActionResult> CreatePublicLead([FromBody] PublicLeadRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Phone))
            {
                return BadRequest(new { message = "Name and phone are required." });
            }

            Machine? machine = null;
            if (request.MachineId.HasValue)
            {
                machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == request.MachineId.Value);
            }

            var lead = new Lead
            {
                Source = "Website",
                SourceDetails = machine != null ? $"Enquiry on {machine.Brand} {machine.Model}" : "General contact form",
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                AdditionalRequirements = request.Message,
                RequiredMachineType = machine?.Type ?? string.Empty,
                RequiredSubType = machine?.SubType ?? string.Empty,
                RequiredBrand = machine?.Brand ?? string.Empty,
                RequiredModel = machine?.Model ?? string.Empty,
                MatchedMachineId = machine?.Id,
                Status = "New",
            };

            _context.Leads.Add(lead);

            if (machine != null)
            {
                machine.InquiryCount += 1;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Thanks — we've received your enquiry and will be in touch shortly." });
        }

        /// <summary>
        /// Update a lead's details / pipeline status. Admin/staff only.
        /// PUT /api/leads/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<LeadDto>> UpdateLead(int id, [FromBody] LeadRequest request)
        {
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
            if (lead == null) return NotFound(new { message = "Lead not found." });

            lead.Source = string.IsNullOrWhiteSpace(request.Source) ? lead.Source : request.Source;
            lead.SourceDetails = request.SourceDetails;
            lead.Name = request.Name;
            lead.Email = request.Email;
            lead.Phone = request.Phone;
            lead.WhatsApp = request.WhatsApp;
            lead.RequiredMachineType = request.RequiredMachineType;
            lead.RequiredSubType = request.RequiredSubType;
            lead.RequiredBrand = request.RequiredBrand;
            lead.RequiredModel = request.RequiredModel;
            lead.AdditionalRequirements = request.AdditionalRequirements;
            lead.BudgetMin = request.BudgetMin;
            lead.BudgetMax = request.BudgetMax;
            lead.PreferredLocation = request.PreferredLocation;
            lead.MatchedMachineId = request.MatchedMachineId;
            lead.Notes = request.Notes ?? lead.Notes;

            if (request.ReferralPartnerId != lead.ReferralPartnerId)
            {
                lead.ReferralPartnerId = request.ReferralPartnerId;
                if (request.ReferralPartnerId.HasValue)
                {
                    var newPartner = await _context.ReferralPartners.FindAsync(request.ReferralPartnerId.Value);
                    if (newPartner != null)
                    {
                        newPartner.LeadsProvided += 1;
                        newPartner.LastActive = DateTime.UtcNow;
                    }
                }
            }
            lead.LastModified = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(request.Status) && request.Status != lead.Status)
            {
                lead.Status = request.Status;
                if (request.Status == "Qualified" && lead.DateQualified == null)
                {
                    lead.DateQualified = DateTime.UtcNow;
                }
            }

            if (request.SubStatus != null)
            {
                lead.SubStatus = request.SubStatus;
            }

            await _context.SaveChangesAsync();

            var reloaded = await _context.Leads
                .Include(l => l.MatchedMachine)
                .Include(l => l.ReferralPartner)
                .FirstAsync(l => l.Id == id);

            return Ok(ToDto(reloaded));
        }

        /// <summary>
        /// Mark a lead as Won and the matched machine as Sold in one step.
        /// POST /api/leads/{id}/mark-sold
        /// </summary>
        [HttpPost("{id:int}/mark-sold")]
        public async Task<ActionResult<LeadDto>> MarkSold(int id, [FromQuery] int machineId)
        {
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
            if (lead == null) return NotFound(new { message = "Lead not found." });

            var machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == machineId && m.IsActive);
            if (machine == null) return NotFound(new { message = "Machine not found." });

            lead.Status = "Won";
            lead.SoldMachineId = machine.Id;
            lead.LastModified = DateTime.UtcNow;

            machine.Status = "Sold";
            machine.DateSold = DateTime.UtcNow;

            if (lead.ReferralPartnerId.HasValue && !lead.ReferralCommissionEarned)
            {
                var partner = await _context.ReferralPartners.FindAsync(lead.ReferralPartnerId.Value);
                if (partner != null)
                {
                    partner.DealsMatured += 1;
                    var commission = partner.CommissionType == "Fixed Amount"
                        ? partner.CommissionPercentage
                        : machine.AskingPrice * (partner.CommissionPercentage / 100m);
                    partner.TotalCommissionEarned += commission;
                    lead.ReferralCommissionEarned = true;
                }
            }

            await _context.SaveChangesAsync();

            var reloaded = await _context.Leads
                .Include(l => l.MatchedMachine)
                .Include(l => l.ReferralPartner)
                .FirstAsync(l => l.Id == id);

            return Ok(ToDto(reloaded));
        }

        /// <summary>
        /// Soft-delete a lead. Admin/staff only.
        /// DELETE /api/leads/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteLead(int id)
        {
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
            if (lead == null) return NotFound(new { message = "Lead not found." });

            lead.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Log an activity against a lead (phone call, WhatsApp, factory visit, etc).
        /// This is how Phone Calls Done / WhatsApp Broadcasts Done KPIs get their data.
        /// POST /api/leads/{id}/activities
        /// </summary>
        [HttpPost("{id:int}/activities")]
        public async Task<ActionResult<LeadActivityDto>> AddActivity(int id, [FromBody] LeadActivityRequest request)
        {
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
            if (lead == null) return NotFound(new { message = "Lead not found." });

            if (string.IsNullOrWhiteSpace(request.ActivityType))
            {
                return BadRequest(new { message = "Activity type is required." });
            }

            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("nameid") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            int? createdByUserId = userIdClaim != null && int.TryParse(userIdClaim.Value, out var uid) ? uid : null;

            var activity = new LeadActivity
            {
                LeadId = lead.Id,
                ActivityType = request.ActivityType,
                Channel = request.Channel,
                Description = request.Description,
                CreatedByUserId = createdByUserId,
            };

            _context.LeadActivities.Add(activity);

            lead.LastFollowUp = DateTime.UtcNow;
            lead.FollowUpCount += 1;
            lead.LastModified = DateTime.UtcNow;
            if (request.ActivityType == ActivityTypes.PhoneCall)
            {
                lead.PhoneCallCount += 1;
            }

            await _context.SaveChangesAsync();

            return Ok(new LeadActivityDto
            {
                Id = activity.Id,
                ActivityType = activity.ActivityType,
                Channel = activity.Channel,
                Description = activity.Description,
                ActivityDate = activity.ActivityDate,
            });
        }

        /// <summary>
        /// Remove a logged activity (e.g. a test/mistaken entry) — also rolls back the
        /// counters it affected so the KPI dashboard stays accurate.
        /// DELETE /api/leads/{id}/activities/{activityId}
        /// </summary>
        [HttpDelete("{id:int}/activities/{activityId:int}")]
        public async Task<ActionResult> DeleteActivity(int id, int activityId)
        {
            var activity = await _context.LeadActivities.FirstOrDefaultAsync(a => a.Id == activityId && a.LeadId == id);
            if (activity == null) return NotFound(new { message = "Activity not found." });

            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Id == id);
            if (lead != null)
            {
                lead.FollowUpCount = Math.Max(0, lead.FollowUpCount - 1);
                if (activity.ActivityType == ActivityTypes.PhoneCall)
                {
                    lead.PhoneCallCount = Math.Max(0, lead.PhoneCallCount - 1);
                }
            }

            _context.LeadActivities.Remove(activity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static LeadDto ToDto(Lead l, bool includeActivities = false) => new LeadDto
        {
            Id = l.Id,
            Source = l.Source,
            SourceDetails = l.SourceDetails,
            Name = l.Name,
            Email = l.Email,
            Phone = l.Phone,
            WhatsApp = l.WhatsApp,
            RequiredMachineType = l.RequiredMachineType,
            RequiredSubType = l.RequiredSubType,
            RequiredBrand = l.RequiredBrand,
            RequiredModel = l.RequiredModel,
            AdditionalRequirements = l.AdditionalRequirements,
            BudgetMin = l.BudgetMin,
            BudgetMax = l.BudgetMax,
            PreferredLocation = l.PreferredLocation,
            Status = l.Status,
            SubStatus = l.SubStatus,
            DateReceived = l.DateReceived,
            DateQualified = l.DateQualified,
            LastFollowUp = l.LastFollowUp,
            MatchedMachineId = l.MatchedMachineId,
            MatchedMachineLabel = l.MatchedMachine != null ? $"{l.MatchedMachine.Brand} {l.MatchedMachine.Model}" : null,
            SoldMachineId = l.SoldMachineId,
            Notes = l.Notes,
            PhoneCallCount = l.PhoneCallCount,
            FollowUpCount = l.FollowUpCount,
            ReferralPartnerId = l.ReferralPartnerId,
            ReferralPartnerName = l.ReferralPartner?.Name,
            ReferralCommissionEarned = l.ReferralCommissionEarned,
            Activities = includeActivities
                ? l.Activities.OrderByDescending(a => a.ActivityDate).Select(a => new LeadActivityDto
                {
                    Id = a.Id,
                    ActivityType = a.ActivityType,
                    Channel = a.Channel,
                    Description = a.Description,
                    ActivityDate = a.ActivityDate,
                }).ToList()
                : new List<LeadActivityDto>(),
        };
    }
}
