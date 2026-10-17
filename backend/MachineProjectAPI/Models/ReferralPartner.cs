using System;
using System.Collections.Generic;

namespace MachineProjectAPI.Models
{
    public class ReferralPartner : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string PartnerType { get; set; } = string.Empty; // TeaVendor, BuildingContractor, Supervisor, FieldStaff, Other
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Commission Details
        public decimal CommissionPercentage { get; set; } = 5; // Default 5% commission
        public string CommissionType { get; set; } = "Percentage"; // Percentage or Fixed Amount

        // Status
        public bool IsActive { get; set; } = true;
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        public DateTime? LastActive { get; set; }

        // Performance Metrics
        public int LeadsProvided { get; set; } = 0;
        public int DealsMatured { get; set; } = 0;
        public decimal TotalCommissionEarned { get; set; } = 0;
        public decimal TotalCommissionPaid { get; set; } = 0;

        public virtual ICollection<Lead> Leads { get; set; } = new List<Lead>();
    }

    // Referral Partner Type Constants
    public static class ReferralPartnerTypes
    {
        public const string TeaVendor = "Tea Vendor";
        public const string BuildingContractor = "Building Contractor";
        public const string Supervisor = "Supervisor";
        public const string FieldStaff = "Field Staff";
        public const string Other = "Other";

        public static List<string> All => new() { TeaVendor, BuildingContractor, Supervisor, FieldStaff, Other };
    }
}
