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
}
