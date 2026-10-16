using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface ITradeProposalRepository : IBaseRepository<TradeProposal>
{
    IEnumerable<TradeProposal> FindUserProposals(string userId);
    TradeProposal? FindProposal(string proposalId);

    // Writes the outcome of a proposal read through FindProposal, only if its state is still the
    // one that was read. Returns false when another action changed it first.
    bool TryRespond(TradeProposal proposal, TradeProposalState outcome, DateTime respondedAt);

    // The step "Remove these cards from my lists" of one side of a Trade read through FindProposal:
    // deletes these rows from that User's lists and marks the step done for that side, all in one
    // save, so either everything is written or nothing is. Returns false, with nothing written, when
    // the Trade's marks or one of these rows changed since they were read (a concurrent submission).
    bool TryRemoveTradeCards(
        TradeProposal trade,
        TradeProposalSide side,
        IEnumerable<WantlistCards> listCards,
        DateTime removedAt
    );
}
