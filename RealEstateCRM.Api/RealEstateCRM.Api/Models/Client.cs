using System.ComponentModel.DataAnnotations;

namespace RealEstateCRM.Api.Models
{
    public class Client
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Phone { get; set; }
        public string? Email { get; set; }

        public string? WorkerComment { get; set; }

        public string Status { get; set; } = "Новий";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}