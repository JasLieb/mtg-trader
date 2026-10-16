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
}
