using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;

namespace MtgTrader.Core.Handlers.TradeProposals;

public interface ITradeProposalHandler
{
    TradeProposalsResponse GetProposals(string userId);
    bool SendProposal(string proposerId, SendTradeProposalRequest request);
    PartnerDoublesResponse? GetPartnerDoubles(string userId, string partnerId);
    CommittedCardsResponse GetCommittedCards(string userId);
    CommittedCardsResponse? GetCommittedCardsIn(string userId, string proposalId);
    TradeProposalActionResult AcceptProposal(string userId, string proposalId);
    TradeProposalActionResult DeclineProposal(string userId, string proposalId);
    TradeProposalActionResult WithdrawProposal(string userId, string proposalId);
    TradeCardsRemovalOutcome RemoveTradeCards(string userId, string proposalId, RemoveTradeCardsRequest request);
}
