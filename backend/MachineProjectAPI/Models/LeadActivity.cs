using System;

namespace MachineProjectAPI.Models
{
    public class LeadActivity : BaseEntity
    {
        public int LeadId { get; set; }
        public string ActivityType { get; set; } = string.Empty; // PhoneCall, WhatsApp, Email, FactoryVisit, etc.
        public string Channel { get; set; } = string.Empty; // WhatsApp, Facebook, Instagram, YouTube, Phone, Direct, etc.
        public string Description { get; set; } = string.Empty;
        public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
        public int? CreatedByUserId { get; set; }

        public virtual Lead? Lead { get; set; }
        public virtual User? CreatedByUser { get; set; }
    }

    // Activity Type Constants
    public static class ActivityTypes
    {
        public const string PhoneCall = "Phone Call";
        public const string WhatsApp = "WhatsApp";
        public const string Email = "Email";
        public const string FactoryVisit = "Factory Visit";
        public const string DirectMeeting = "Direct Meeting";
        public const string MarketingPost = "Marketing Post";
        public const string Negotiation = "Negotiation";
        public const string Deal = "Deal";
        public const string Other = "Other";

        public static List<string> All => new()
        {
            PhoneCall, WhatsApp, Email, FactoryVisit, DirectMeeting,
            MarketingPost, Negotiation, Deal, Other
        };
    }

    // Marketing Channels
    public static class MarketingChannels
    {
        public const string WhatsAppStatus = "WhatsApp Status";
        public const string WhatsAppBroadcast = "WhatsApp Broadcast";
        public const string FacebookGroup = "Facebook Group";
        public const string FacebookPage = "Facebook Page";
        public const string InstagramPage = "Instagram Page";
        public const string YouTube = "YouTube";
        public const string PhoneCall = "Phone Call";
        public const string DirectOutreach = "Direct Outreach";

        public static List<string> All => new()
        {
            WhatsAppStatus, WhatsAppBroadcast, FacebookGroup, FacebookPage,
            InstagramPage, YouTube, PhoneCall, DirectOutreach
        };
    }
}
