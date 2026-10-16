using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;

namespace MtgTrader.Core.Handlers.TradeProposals;

public interface ITradeProposalHandler
{
    TradeProposalsResponse GetProposals(string userId);
    bool SendProposal(string proposerId, SendTradeProposalRequest request);
    PartnerDoublesResponse? GetPartnerDoubles(string userId, string partnerId);
}
