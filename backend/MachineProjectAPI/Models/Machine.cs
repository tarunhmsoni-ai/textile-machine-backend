using System;
using System.Collections.Generic;

namespace MachineProjectAPI.Models
{
    public class Machine : BaseEntity
    {
        public string Type { get; set; } = string.Empty; // Knitting, Weaving, Warping
        public string SubType { get; set; } = string.Empty; // e.g., Circular Knitting, Power Loom
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal AskingPrice { get; set; }
        public int Quantity { get; set; } = 1;

        // Media
        public List<string> Photos { get; set; } = new(); // URLs to photos
        public string? VideoUrl { get; set; }
        public string? PlatePhotoUrl { get; set; }

        // Description & Condition
        public string Description { get; set; } = string.Empty;
        public string Condition { get; set; } = "Good"; // Excellent, Good, Fair, Poor

        // Seller Information
        public string SellerName { get; set; } = string.Empty;
        public string SellerPhone { get; set; } = string.Empty;
        public string SellerEmail { get; set; } = string.Empty;
        public string SellerWhatsApp { get; set; } = string.Empty;

        // Specifications (stored as JSON string for flexibility)
        public string SpecificationsJson { get; set; } = "{}";

        // Machine Status
        public string Status { get; set; } = "Draft"; // Draft, Verified, Live, Sold, Archived
        public DateTime? DateLive { get; set; }
        public DateTime? DateSold { get; set; }

        // Tracking
        public int? PostedByUserId { get; set; }
        public DateTime DatePosted { get; set; } = DateTime.UtcNow;
        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        // Marketing & Leads
        public int ViewCount { get; set; } = 0;
        public int InquiryCount { get; set; } = 0;

        public virtual User? PostedByUser { get; set; }
        public virtual ICollection<Lead> Leads { get; set; } = new List<Lead>();
    }

    // Machine Type Constants
    public static class MachineTypes
    {
        public const string Knitting = "Knitting";
        public const string Weaving = "Weaving";
        public const string Warping = "Warping";

        public static List<string> All => new() { Knitting, Weaving, Warping };
    }

    // Knitting Machine SubTypes
    public static class KnittingSubTypes
    {
        public const string WarpKnitting = "Warp Knitting";
        public const string CircularKnitting = "Circular Knitting";
        public const string FlatKnitting = "Flat Knitting";
        public const string Beams = "Beams";

        public static List<string> All => new() { WarpKnitting, CircularKnitting, FlatKnitting, Beams };
    }

    // Weaving Machine SubTypes
    public static class WeavingSubTypes
    {
        public const string WatarjetLoom = "Waterjet Loom";
        public const string AirjetLoom = "Airjet Loom";
        public const string RapierLoom = "Rapier Loom";
        public const string PowerLoom = "Power Loom";

        public static List<string> All => new() { WatarjetLoom, AirjetLoom, RapierLoom, PowerLoom };
    }

    // Warping Machine SubTypes
    public static class WarpingSubTypes
    {
        public const string DirectWarping = "Direct Warping";
        public const string SplitWarping = "Split Warping";
        public const string Beamer = "Beamer";

        public static List<string> All => new() { DirectWarping, SplitWarping, Beamer };
    }
}
