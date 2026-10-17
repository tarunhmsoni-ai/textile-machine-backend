using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;

namespace MachineProjectAPI.Controllers
{
    /// <summary>
    /// The 10 KPIs from the client's KPI.docx, computed live for a date range.
    /// Admin only, per the client's doc ("KPI shall be visible to Admin only").
    /// </summary>
    [ApiController]
    [Route("api/kpi")]
    [Authorize(Roles = UserRoles.Admin)]
    public class KpiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KpiController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/kpi?start=2026-10-01&amp;end=2026-10-31
        /// Defaults to the current calendar month when no range is given.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<KpiSummaryDto>> GetSummary([FromQuery] DateTime? start, [FromQuery] DateTime? end)
        {
            // Npgsql requires DateTimeKind.Utc for "timestamp with time zone" columns —
            // both `new DateTime(...)` and model-bound query-string dates default to
            // Unspecified, which throws at query time. Normalize explicitly.
            DateTime AsUtc(DateTime d) => DateTime.SpecifyKind(d.Date, DateTimeKind.Utc);

            var periodStart = AsUtc(start ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1));
            var periodEnd = AsUtc(end ?? periodStart.AddMonths(1).AddDays(-1)).AddDays(1).AddTicks(-1);

            var machinesReceived = await _context.Machines
                .CountAsync(m => m.IsActive && m.DatePosted >= periodStart && m.DatePosted <= periodEnd);

            var queriesReceived = await _context.Leads
                .CountAsync(l => l.IsActive && l.DateReceived >= periodStart && l.DateReceived <= periodEnd);

            var soldMachinesInPeriod = await _context.Machines
                .Where(m => m.Status == "Sold" && !m.SoldByOtherBroker && m.DateSold != null
                    && m.DateSold >= periodStart && m.DateSold <= periodEnd)
                .ToListAsync();

            var machinesSold = soldMachinesInPeriod.Count;

            var machinesSoldByOtherBroker = await _context.Machines
                .CountAsync(m => m.SoldByOtherBroker && m.DateSold != null
                    && m.DateSold >= periodStart && m.DateSold <= periodEnd);

            double? averageTurnaroundDays = soldMachinesInPeriod.Count > 0
                ? soldMachinesInPeriod.Average(m => (m.DateSold!.Value - m.DatePosted).TotalDays)
                : null;

            var phoneCallsDone = await _context.LeadActivities
                .CountAsync(a => a.ActivityType == ActivityTypes.PhoneCall
                    && a.ActivityDate >= periodStart && a.ActivityDate <= periodEnd);

            var whatsAppBroadcastsDone = await _context.LeadActivities
                .CountAsync(a => a.Channel == MarketingChannels.WhatsAppBroadcast
                    && a.ActivityDate >= periodStart && a.ActivityDate <= periodEnd);

            var customersAdded = await _context.Contacts
                .CountAsync(c => c.IsActive && c.ContactType == ContactTypes.Customer
                    && c.DateAdded >= periodStart && c.DateAdded <= periodEnd);

            var dealersAdded = await _context.Contacts
                .CountAsync(c => c.IsActive && c.ContactType == ContactTypes.Dealer
                    && c.DateAdded >= periodStart && c.DateAdded <= periodEnd);

            var mastersAdded = await _context.Contacts
                .CountAsync(c => c.IsActive && c.ContactType == ContactTypes.Master
                    && c.DateAdded >= periodStart && c.DateAdded <= periodEnd);

            var referralPartnersActive = await _context.ReferralPartners.CountAsync(p => p.IsActive);
            var referralLeadsProvided = await _context.ReferralPartners.Where(p => p.IsActive).SumAsync(p => (int?)p.LeadsProvided) ?? 0;
            var referralDealsMatured = await _context.ReferralPartners.Where(p => p.IsActive).SumAsync(p => (int?)p.DealsMatured) ?? 0;
            var referralCommissionEarned = await _context.ReferralPartners.Where(p => p.IsActive).SumAsync(p => (decimal?)p.TotalCommissionEarned) ?? 0;

            return Ok(new KpiSummaryDto
            {
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                MachinesReceived = machinesReceived,
                QueriesReceived = queriesReceived,
                MachinesSold = machinesSold,
                MachinesSoldByOtherBroker = machinesSoldByOtherBroker,
                AverageTurnaroundDays = averageTurnaroundDays,
                PhoneCallsDone = phoneCallsDone,
                WhatsAppBroadcastsDone = whatsAppBroadcastsDone,
                CustomersAdded = customersAdded,
                MachineDealersAdded = dealersAdded,
                MastersAdded = mastersAdded,
                ReferralPartnersActive = referralPartnersActive,
                ReferralLeadsProvided = referralLeadsProvided,
                ReferralDealsMatured = referralDealsMatured,
                ReferralCommissionEarned = referralCommissionEarned,
            });
        }
    }
}
