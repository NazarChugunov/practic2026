using System.ComponentModel.DataAnnotations;

namespace RealEstateCRM.Api.Models
{
    public class RealEstateObject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal Price { get; set; }
        public double Area { get; set; }
        public int Floor { get; set; }

        public string City { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string? HouseNumber { get; set; }
        public string Status { get; set; } = "Доступно";

        public List<string> ImageUrls { get; set; } = new List<string>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}