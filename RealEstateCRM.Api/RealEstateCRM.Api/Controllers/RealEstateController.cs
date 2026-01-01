using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstateCRM.Api.Data;
using RealEstateCRM.Api.Models;

namespace RealEstateCRM.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RealEstateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public RealEstateController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RealEstateObject>>> GetRealEstates()
        {
            return await _context.RealEstates
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<RealEstateObject>> PostRealEstate(
            [FromForm] RealEstateObject realEstate,
            [FromForm] List<IFormFile> photos)
        {
            if (photos != null && photos.Count > 0)
            {
                string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string uploadPath = Path.Combine(webRootPath, "uploads");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                foreach (var photo in photos)
                {
                    if (photo.Length > 0)
                    {
                        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(photo.FileName);
                        using (var stream = new FileStream(Path.Combine(uploadPath, fileName), FileMode.Create))
                        {
                            await photo.CopyToAsync(stream);
                        }
                        realEstate.ImageUrls.Add($"/uploads/{fileName}");
                    }
                }
            }

            realEstate.CreatedAt = DateTime.UtcNow;
            _context.RealEstates.Add(realEstate);
            await _context.SaveChangesAsync();

            return Ok(realEstate);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RealEstateObject>> PutRealEstate(
            int id,
            [FromForm] RealEstateObject updated,
            [FromForm] List<IFormFile>? photos)
        {
            var existing = await _context.RealEstates.FirstOrDefaultAsync(x => x.Id == id);
            if (existing == null) return NotFound();

            existing.Title = updated.Title;
            existing.Price = updated.Price;
            existing.City = updated.City;
            existing.Street = updated.Street;
            existing.HouseNumber = updated.HouseNumber;
            existing.Area = updated.Area;
            existing.Floor = updated.Floor;
            existing.Description = updated.Description;
            existing.Status = updated.Status;

            if (photos != null && photos.Count > 0)
            {
                string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string uploadPath = Path.Combine(webRootPath, "uploads");
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                foreach (var photo in photos)
                {
                    if (photo.Length > 0)
                    {
                        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(photo.FileName);
                        using (var stream = new FileStream(Path.Combine(uploadPath, fileName), FileMode.Create))
                        {
                            await photo.CopyToAsync(stream);
                        }
                        existing.ImageUrls.Add($"/uploads/{fileName}");
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRealEstate(int id)
        {
            var existing = await _context.RealEstates.FirstOrDefaultAsync(x => x.Id == id);
            if (existing == null) return NotFound();

            if (existing.ImageUrls != null && existing.ImageUrls.Count > 0)
            {
                string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

                foreach (var url in existing.ImageUrls)
                {
                    try
                    {
                        var relative = url.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
                        var fullPath = Path.Combine(webRootPath, relative);

                        if (System.IO.File.Exists(fullPath))
                            System.IO.File.Delete(fullPath);
                    }
                    catch
                    {
                    }
                }
            }

            _context.RealEstates.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
