using System;

namespace MachineProjectAPI.Models
{
    // The office internet connection(s) a Staff-role login is restricted to.
    // Managed by Admin only. Admin logins are never checked against this list.
    public class StaffAccessIp : BaseEntity
    {
        public string IpAddress { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty; // e.g. "Office - Ahmedabad"
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    }
}
