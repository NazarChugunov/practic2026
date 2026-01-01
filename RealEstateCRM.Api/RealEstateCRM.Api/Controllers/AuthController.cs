using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstateCRM.Api.Data;
using RealEstateCRM.Api.Models;
using RealEstateCRM.Api.Dtos.User;
using BCrypt.Net;

namespace RealEstateCRM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AuthController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User dto)
        {
            dto.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);
            _context.Users.Add(dto);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Реєстрація успішна" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.PasswordHash, user.PasswordHash))
                return BadRequest("Невірний логін або пароль");

            return Ok(user);
        }

        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar([FromForm] UploadAvatarDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Login);
            if (user == null) return NotFound("Користувача не знайдено.");

            string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "avatars");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string extension = Path.GetExtension(dto.File.FileName);
            string uniqueFileName = $"avatar_{Guid.NewGuid()}{extension}";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            user.AvatarUrl = $"/uploads/avatars/{uniqueFileName}";
            await _context.SaveChangesAsync();

            return Ok(user);
        }
    }
}