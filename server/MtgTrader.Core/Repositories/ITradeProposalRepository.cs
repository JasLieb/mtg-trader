using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface ITradeProposalRepository : IBaseRepository<TradeProposal>
{
    IEnumerable<TradeProposal> FindUserProposals(string userId);
    TradeProposal? FindProposal(string proposalId);

    // Writes the outcome of a proposal read through FindProposal, only if its state is still the
    // one that was read. Returns false when another action changed it first.
    bool TryRespond(TradeProposal proposal, TradeProposalState outcome, DateTime respondedAt);
}
