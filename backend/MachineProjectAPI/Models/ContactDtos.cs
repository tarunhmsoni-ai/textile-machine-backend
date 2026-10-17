using System;

namespace MachineProjectAPI.Models
{
    public class ContactDto
    {
        public int Id { get; set; }
        public string ContactType { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime DateAdded { get; set; }
    }

    public class ContactRequest
    {
        public string ContactType { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}
