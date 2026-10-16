namespace MtgTrader.Core.Entities.Business.Responses;

public record TradeProposalsResponse(
    IEnumerable<TradeProposalResponse> Proposals
);

// Seen from the user asking: IsSent tells whether they made the proposal,
// GivenCards are the cards they give and ReceivedCards the cards they receive.
public record TradeProposalResponse(
    string Id,
    bool IsSent,
    string OtherUserId,
    string OtherUserName,
    IEnumerable<string> GivenCards,
    IEnumerable<string> ReceivedCards,
    string State,
    DateTime SentAt
);
