using System;

namespace MachineProjectAPI.Models
{
    // Covers the three simple registries the client's KPI doc calls out —
    // Customers, Machine Dealers, and Masters (the mechanics who verify
    // machine condition) — which share the same shape, so one table with a
    // ContactType discriminator avoids three near-identical entities.
    public class Contact : BaseEntity
    {
        public string ContactType { get; set; } = string.Empty; // Customer, Dealer, Master
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    }

    public static class ContactTypes
    {
        public const string Customer = "Customer";
        public const string Dealer = "Dealer";
        public const string Master = "Master";

        public static List<string> All => new() { Customer, Dealer, Master };
    }
}
