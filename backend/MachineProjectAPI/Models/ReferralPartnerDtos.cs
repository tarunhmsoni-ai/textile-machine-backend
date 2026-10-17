using System;

namespace MachineProjectAPI.Models
{
    public class ReferralPartnerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PartnerType { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal CommissionPercentage { get; set; }
        public string CommissionType { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime DateAdded { get; set; }
        public DateTime? LastActive { get; set; }
        public int LeadsProvided { get; set; }
        public int DealsMatured { get; set; }
        public decimal TotalCommissionEarned { get; set; }
        public decimal TotalCommissionPaid { get; set; }
        public decimal CommissionOwed => TotalCommissionEarned - TotalCommissionPaid;
    }

    public class ReferralPartnerRequest
    {
        public string Name { get; set; } = string.Empty;
        public string PartnerType { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal CommissionPercentage { get; set; } = 5;
        public string CommissionType { get; set; } = "Percentage";
    }

    public class RecordPaymentRequest
    {
        public decimal Amount { get; set; }
    }
}
