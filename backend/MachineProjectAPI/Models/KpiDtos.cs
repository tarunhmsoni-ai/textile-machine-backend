using System;

namespace MachineProjectAPI.Models
{
    // Computed live from Machines/Leads/LeadActivity/Contacts/ReferralPartners for
    // the given date range — no separate snapshot table to keep populated.
    public class KpiSummaryDto
    {
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }

        public int MachinesReceived { get; set; }
        public int QueriesReceived { get; set; }
        public int MachinesSold { get; set; }
        public int MachinesSoldByOtherBroker { get; set; }
        public double? AverageTurnaroundDays { get; set; }
        public int PhoneCallsDone { get; set; }
        public int WhatsAppBroadcastsDone { get; set; }
        public int CustomersAdded { get; set; }
        public int MachineDealersAdded { get; set; }
        public int MastersAdded { get; set; }

        public int ReferralPartnersActive { get; set; }
        public int ReferralLeadsProvided { get; set; }
        public int ReferralDealsMatured { get; set; }
        public decimal ReferralCommissionEarned { get; set; }
    }
}
