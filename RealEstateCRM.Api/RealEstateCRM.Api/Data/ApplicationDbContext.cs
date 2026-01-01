using Microsoft.EntityFrameworkCore;
using RealEstateCRM.Api.Models;

namespace RealEstateCRM.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<RealEstateObject> RealEstates { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<User> Users { get; set; }
    }
}