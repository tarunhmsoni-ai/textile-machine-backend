using System.Collections.Generic;

namespace MachineProjectAPI.Models
{
    // Shape consumed by the homepage / listings grid (MachineListings.jsx, HomePage.jsx)
    public class MachineListDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Subtype { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Photo { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = string.Empty;
    }

    // Shape consumed by the machine detail page (MachineDetail.jsx)
    public class MachineDetailDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Subtype { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public List<string> Photos { get; set; } = new();
        public string? VideoUrl { get; set; }
        public SellerDto Seller { get; set; } = new();
        public Dictionary<string, string> Specifications { get; set; } = new();
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = string.Empty;
    }

    public class SellerDto
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Whatsapp { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    // [FromForm] model for creating/updating a machine with file uploads
    public class MachineFormRequest
    {
        public string Type { get; set; } = string.Empty;
        public string SubType { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int? Year { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal? AskingPrice { get; set; }
        public int? Quantity { get; set; }
        public string? Description { get; set; }
        public string Condition { get; set; } = "Good";
        public string SellerName { get; set; } = string.Empty;
        public string SellerPhone { get; set; } = string.Empty;
        public string? SellerEmail { get; set; }
        public string? SellerWhatsApp { get; set; }
        public string? SpecificationsJson { get; set; }

        public List<Microsoft.AspNetCore.Http.IFormFile>? Photos { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? Video { get; set; }
    }
}
