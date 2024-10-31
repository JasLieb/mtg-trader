using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Infrastructure.Contexts;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Wantlist> Wantlists { get; set; }
    public DbSet<WantlistCards> WantlistCards { get; set; }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Wantlist>().Ignore(e => e.Cards);
        modelBuilder.Entity<Wantlist>()
            .HasMany(e => e.Cards)
            .WithOne(e => e.WantlistOrigin)
            .HasForeignKey(e => e.WantlistId);
        
        modelBuilder.Entity<WantlistCards>().Ignore(e => e.WantlistOrigin);
    }
}