using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace RealEstateCRM.Api.Dtos.User
{
    public class UploadAvatarDto
    {
        [Required]
        public string Login { get; set; } = string.Empty;

        [Required]
        public IFormFile File { get; set; }
    }
}