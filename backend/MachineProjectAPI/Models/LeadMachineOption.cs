namespace MachineProjectAPI.Models
{
    // One machine offered to one lead, tracked machine-wise (the client's pipeline:
    // sent -> called -> visit planned/done -> liked -> negotiation -> won).
    public class LeadMachineOption : BaseEntity
    {
        public int LeadId { get; set; }
        public int MachineId { get; set; }
        public string Stage { get; set; } = OptionStages.Suggested;
        public string Notes { get; set; } = string.Empty;
        public string UpdatedByName { get; set; } = string.Empty;

        public virtual Lead? Lead { get; set; }
        public virtual Machine? Machine { get; set; }
    }

    public static class OptionStages
    {
        public const string Suggested = "Suggested";
        public static readonly string[] All =
        {
            "Suggested", "Sent on WhatsApp", "Phone call done", "Visit planned", "Visit done",
            "Liked", "Negotiation", "Rejected", "Won",
        };
    }

    // A call made to a referral partner (tea vendor, contractor, ...) — counted in the KPI "phone calls done".
    public class PartnerCall : BaseEntity
    {
        public int PartnerId { get; set; }
        public DateTime CalledOn { get; set; } = DateTime.UtcNow.Date;
        public string Outcome { get; set; } = string.Empty; // one of PartnerCallOutcomes.All
        public string Notes { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;

        public virtual ReferralPartner? Partner { get; set; }
    }

    public static class PartnerCallOutcomes
    {
        public static readonly string[] All =
        {
            "Promised a lead", "Call back later", "Not reachable", "Not interested", "Gave a lead",
        };
    }

    // One row per pipeline step a machine moved through: who moved it, from where, and when.
    public class MachineStageLog : BaseEntity
    {
        public int MachineId { get; set; }
        public string FromStatus { get; set; } = string.Empty;
        public string ToStatus { get; set; } = string.Empty;
        public string ByName { get; set; } = string.Empty;

        public virtual Machine? Machine { get; set; }
    }
}
