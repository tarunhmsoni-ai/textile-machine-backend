namespace MachineProjectAPI.Models
{
    // Visitors who asked for "special offers in your inbox" on the website.
    public class Subscriber : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string WhatsApp { get; set; } = string.Empty;
        public string Source { get; set; } = "Website";
    }
}
