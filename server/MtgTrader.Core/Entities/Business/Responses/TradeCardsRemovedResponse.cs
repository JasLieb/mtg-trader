namespace MtgTrader.Core.Entities.Business.Responses;

// The user's lists and proposals in full, once they have removed a Trade's Cards from their lists.
// Wantlists is what WantlistsResponse carries, since the client rebuilds its wantlists and doubles from
// every list mutation's answer; Proposals is what TradeProposalsResponse carries, where the step now shows as done.
public record TradeCardsRemovedResponse(
    IEnumerable<WantlistResponse> Wantlists,
    IEnumerable<TradeProposalResponse> Proposals
);
