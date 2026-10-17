using System;
using System.Collections.Generic;

namespace MachineProjectAPI.Models
{
    public class Lead : BaseEntity
    {
        // Lead Source
        public string Source { get; set; } = string.Empty; // Website, Phone, WhatsApp, Email, Referral
        public string SourceDetails { get; set; } = string.Empty;

        // Contact Information
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;

        // Machine Requirement
        public string RequiredMachineType { get; set; } = string.Empty; // Knitting, Weaving, Warping
        public string RequiredSubType { get; set; } = string.Empty;
        public string RequiredBrand { get; set; } = string.Empty;
        public string RequiredModel { get; set; } = string.Empty;
        public string AdditionalRequirements { get; set; } = string.Empty;

        // Budget
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }

        // Location Preference
        public string PreferredLocation { get; set; } = string.Empty;

        // Pipeline Status
        public string Status { get; set; } = "New"; // New, Qualified, Contacted, Factory Visit, Negotiation, Won, Lost
        public string SubStatus { get; set; } = string.Empty; // Additional details about status

        // Per the client's access control: staff can enter leads and work them up
        // to this point, then the lead stops being visible to staff entirely.
        public bool RequirementEntered { get; set; } = false;

        // Tracking
        public DateTime DateReceived { get; set; } = DateTime.UtcNow;
        public DateTime? DateQualified { get; set; }
        public DateTime? LastFollowUp { get; set; }
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        public int? AssignedToUserId { get; set; }

        // Machine Matching
        public int? MatchedMachineId { get; set; }
        public int? SoldMachineId { get; set; }

        // Notes & History
        public string Notes { get; set; } = string.Empty;
        public int PhoneCallCount { get; set; } = 0;
        public int FollowUpCount { get; set; } = 0;

        // Referral Info (if from referral partner)
        public int? ReferralPartnerId { get; set; }
        public bool ReferralCommissionEarned { get; set; } = false;

        public virtual Machine? MatchedMachine { get; set; }
        public virtual Machine? SoldMachine { get; set; }
        public virtual User? AssignedToUser { get; set; }
        public virtual ReferralPartner? ReferralPartner { get; set; }
        public virtual ICollection<LeadActivity> Activities { get; set; } = new List<LeadActivity>();
    }

    // Lead Status Constants
    public static class LeadStatus
    {
        public const string New = "New";
        public const string Qualified = "Qualified";
        public const string Contacted = "Contacted";
        public const string FactoryVisit = "Factory Visit";
        public const string Negotiation = "Negotiation";
        public const string Won = "Won";
        public const string Lost = "Lost";

        public static List<string> All => new() { New, Qualified, Contacted, FactoryVisit, Negotiation, Won, Lost };
    }
}
