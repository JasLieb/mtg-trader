using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Infrastructure.Contexts;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Wantlist> Wantlists { get; set; }
    public DbSet<WantlistCards> WantlistCards { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    override protected void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Wantlist>().Ignore(e => e.Cards);
        modelBuilder.Entity<Wantlist>()
            .HasMany(e => e.Cards)
            .WithOne(e => e.WantlistOrigin)
            .HasForeignKey(e => e.WantlistId);
        
        modelBuilder.Entity<WantlistCards>().Ignore(e => e.WantlistOrigin);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(e => e.Author)
            .WithMany(e => e.SentMessages)
            .HasForeignKey(e => e.AuthorId);
        
        modelBuilder.Entity<ChatMessage>()
            .HasOne(e => e.Recipient)
            .WithMany(e => e.ReceivedMessages)
            .HasForeignKey(e => e.RecipientId);
        
        modelBuilder.Entity<User>().Ignore(e => e.SentMessages);
        modelBuilder.Entity<User>().Ignore(e => e.ReceivedMessages);
    }
}