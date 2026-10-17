using System;
using System.Collections.Generic;

namespace MachineProjectAPI.Models
{
    // Shape consumed by the admin Leads/Pipeline page
    public class LeadDto
    {
        public int Id { get; set; }
        public string Source { get; set; } = string.Empty;
        public string SourceDetails { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string RequiredMachineType { get; set; } = string.Empty;
        public string RequiredSubType { get; set; } = string.Empty;
        public string RequiredBrand { get; set; } = string.Empty;
        public string RequiredModel { get; set; } = string.Empty;
        public string AdditionalRequirements { get; set; } = string.Empty;
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public string PreferredLocation { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string SubStatus { get; set; } = string.Empty;
        public DateTime DateReceived { get; set; }
        public DateTime? DateQualified { get; set; }
        public DateTime? LastFollowUp { get; set; }
        public int? MatchedMachineId { get; set; }
        public string? MatchedMachineLabel { get; set; }
        public int? SoldMachineId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int PhoneCallCount { get; set; }
        public int FollowUpCount { get; set; }
        public int? ReferralPartnerId { get; set; }
        public string? ReferralPartnerName { get; set; }
        public bool ReferralCommissionEarned { get; set; }
        public List<LeadActivityDto> Activities { get; set; } = new();
    }

    public class LeadActivityDto
    {
        public int Id { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; }
    }

    // [FromBody] model for creating/updating a lead from the admin panel
    public class LeadRequest
    {
        public string Source { get; set; } = "Website";
        public string SourceDetails { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string RequiredMachineType { get; set; } = string.Empty;
        public string RequiredSubType { get; set; } = string.Empty;
        public string RequiredBrand { get; set; } = string.Empty;
        public string RequiredModel { get; set; } = string.Empty;
        public string AdditionalRequirements { get; set; } = string.Empty;
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public string PreferredLocation { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string? SubStatus { get; set; }
        public int? MatchedMachineId { get; set; }
        public string? Notes { get; set; }
        public int? ReferralPartnerId { get; set; }
    }

    // Submitted anonymously from the website's "Contact Form" / machine-detail enquiry
    public class PublicLeadRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int? MachineId { get; set; }
    }

    public class LeadActivityRequest
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
