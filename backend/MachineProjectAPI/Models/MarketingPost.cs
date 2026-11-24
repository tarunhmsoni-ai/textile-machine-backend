namespace MachineProjectAPI.Models
{
    // One row = "this machine was promoted on this channel on this day" (the client's marketing tracker).
    public class MarketingPost : BaseEntity
    {
        public int MachineId { get; set; }
        public string Channel { get; set; } = string.Empty; // one of MarketingChannels.All
        public DateTime PostedOn { get; set; } = DateTime.UtcNow.Date;
        public string Notes { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;

        public virtual Machine? Machine { get; set; }
    }
}
