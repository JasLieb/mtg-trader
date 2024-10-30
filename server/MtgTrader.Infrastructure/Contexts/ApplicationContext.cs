using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Infrastructure.Contexts;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Wantlist> Wantlists { get; set; }
    public DbSet<WantlistCards> WantlistCards { get; set; }
    public DbSet<Card> Cards { get; set; }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().Ignore(e => e.Wantlists);
        modelBuilder.Entity<User>()
            .HasMany(e => e.Wantlists)
            .WithOne(e => e.Owner)
            .HasForeignKey(e => e.OwnerId);

        modelBuilder.Entity<Wantlist>().Ignore(e => e.Cards);
        modelBuilder.Entity<Wantlist>().Ignore(e => e.Owner);
        modelBuilder.Entity<Wantlist>()
            .HasMany(e => e.Cards)
            .WithOne(e => e.WantlistOrigin)
            .HasForeignKey(e => e.WantlistId);
        
        modelBuilder.Entity<Card>().Ignore(e => e.ReferencedInWantlists);
        modelBuilder.Entity<Card>()
            .HasMany(e => e.ReferencedInWantlists)
            .WithOne(e => e.CardOrigin)
            .HasForeignKey(e => e.CardId);
        
        modelBuilder.Entity<WantlistCards>().Ignore(e => e.WantlistOrigin);
        modelBuilder.Entity<WantlistCards>().Ignore(e => e.CardOrigin);
    }
}