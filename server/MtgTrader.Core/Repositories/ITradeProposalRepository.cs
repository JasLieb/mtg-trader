using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface ITradeProposalRepository : IBaseRepository<TradeProposal>
{
    IEnumerable<TradeProposal> FindUserProposals(string userId);
}
