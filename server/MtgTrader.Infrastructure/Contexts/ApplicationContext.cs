using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Infrastructure.Contexts;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Wantlist> Wantlists { get; set; }
    public DbSet<WantlistCards> WantlistCards { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<TradeProposal> TradeProposals { get; set; }
    public DbSet<TradeProposalCard> TradeProposalCards { get; set; }

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

        modelBuilder.Entity<User>().HasIndex(e => e.Username).IsUnique();
        modelBuilder.Entity<User>().Ignore(e => e.SentMessages);
        modelBuilder.Entity<User>().Ignore(e => e.ReceivedMessages);

        modelBuilder.Entity<TradeProposal>()
            .HasMany(e => e.Cards)
            .WithOne()
            .HasForeignKey(e => e.TradeProposalId);
        modelBuilder.Entity<TradeProposal>()
            .Property(e => e.State)
            .HasConversion<string>();
        // Each update is written only if State still holds the value that was read, so of two
        // concurrent actions on a pending proposal only the first one succeeds.
        modelBuilder.Entity<TradeProposal>()
            .Property(e => e.State)
            .IsConcurrencyToken();
        // Restrict, not cascade: what deleting an account does to its trades is still to decide (backlog ticket 21).
        modelBuilder.Entity<TradeProposal>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(e => e.ProposerId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TradeProposal>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(e => e.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TradeProposalCard>()
            .Property(e => e.GivenBy)
            .HasConversion<string>();
    }
}