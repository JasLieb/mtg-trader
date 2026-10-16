using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class TradeProposalRepository(ApplicationContext dbContext)
    : BaseRepository<TradeProposal>(dbContext), ITradeProposalRepository
{
    public IEnumerable<TradeProposal> FindUserProposals(string userId) =>
        [
            .. DbSet.Where(proposal => proposal.ProposerId == userId || proposal.RecipientId == userId)
                .Include(proposal => proposal.Cards)
        ];

    public TradeProposal? FindProposal(string proposalId) =>
        DbSet.Include(proposal => proposal.Cards)
            .FirstOrDefault(proposal => proposal.Id == proposalId);

    public bool TryRespond(TradeProposal proposal, TradeProposalState outcome, DateTime respondedAt)
    {
        proposal.State = outcome;
        proposal.RespondedAt = respondedAt;
        try
        {
            // State is a concurrency token: the UPDATE matches the row only if State is unchanged
            // since the proposal was read, and EF throws when no row matches.
            return Context.SaveChanges() > 0;
        }
        catch (DbUpdateConcurrencyException e)
        {
            // Read the state that won again, so the proposals returned next come from the database.
            foreach (var entry in e.Entries)
                entry.Reload();
            return false;
        }
    }

    public bool TryRemoveTradeCards(
        TradeProposal trade,
        TradeProposalSide side,
        IEnumerable<WantlistCards> listCards,
        DateTime removedAt
    )
    {
        // Staged, not deleted through BaseRepository.Delete, which would save each row on its own:
        // the one SaveChanges below sends every DELETE and the UPDATE of the mark in a single
        // transaction, which EF rolls back as a whole when any of them fails.
        Context.Set<WantlistCards>().RemoveRange(listCards);
        SetRemovedCardsAt(trade, side, removedAt);
        try
        {
            // Both marks are concurrency tokens, like State: the UPDATE matches the row only if neither
            // changed since the Trade was read. A DELETE whose row is already gone matches nothing either.
            // EF throws in both cases.
            return Context.SaveChanges() > 0;
        }
        catch (DbUpdateConcurrencyException e)
        {
            // Nothing was written. The Trade goes back to what the database holds, and the request's
            // context, with the removals it staged, is discarded once the refusal is answered.
            SetRemovedCardsAt(trade, side, null);
            foreach (var entry in e.Entries)
                entry.Reload();
            return false;
        }
    }

    private static void SetRemovedCardsAt(TradeProposal trade, TradeProposalSide side, DateTime? removedAt)
    {
        if (side == TradeProposalSide.Proposer)
            trade.ProposerRemovedCardsAt = removedAt;
        else
            trade.RecipientRemovedCardsAt = removedAt;
    }
}
