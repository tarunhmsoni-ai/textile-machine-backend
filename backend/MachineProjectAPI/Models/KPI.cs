using System;

namespace MachineProjectAPI.Models
{
    public class KPI : BaseEntity
    {
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }

        // Machine KPIs
        public int MachinesReceived { get; set; } = 0;
        public int MachinesLive { get; set; } = 0;
        public int MachinesSold { get; set; } = 0;
        public int MachinesSoldByOtherBroker { get; set; } = 0;

        // Lead KPIs
        public int QueriesReceived { get; set; } = 0;
        public int LeadsQualified { get; set; } = 0;
        public int LeadsWon { get; set; } = 0;
        public int LeadsLost { get; set; } = 0;

        // Activity KPIs
        public int PhoneCallsMade { get; set; } = 0;
        public int WhatsAppMessagesSent { get; set; } = 0;
        public int WhatsAppBroadcastsDone { get; set; } = 0;
        public int EmailsSent { get; set; } = 0;
        public int FactoryVisits { get; set; } = 0;

        // Partnership KPIs
        public int CustomersAdded { get; set; } = 0;
        public int MachineDealersAdded { get; set; } = 0;
        public int MastersAdded { get; set; } = 0;
        public int ReferralPartnersAdded { get; set; } = 0;

        // Financial KPIs
        public decimal TotalRevenue { get; set; } = 0;
        public decimal AverageTransactionValue { get; set; } = 0;
        public decimal CommissionsPaid { get; set; } = 0;

        // Time-based KPIs
        public double AverageTurnaroundDays { get; set; } = 0;
        public double AverageTimeToFirstContact { get; set; } = 0;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class KPIQuery
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? PeriodType { get; set; } // Daily, Weekly, Monthly, Quarterly, Yearly
    }
}
