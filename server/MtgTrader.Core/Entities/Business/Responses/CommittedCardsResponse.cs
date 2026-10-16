namespace MtgTrader.Core.Entities.Business.Responses;

// Committed Cards of the user asking: Cards they give in a proposal still pending, or in a Trade whose
// Cards they have not yet removed from their lists. Only ever sent to that user, and never part of a
// proposal's response, so the other User of a proposal never sees them.
public record CommittedCardsResponse(
    IEnumerable<CommittedCardResponse> CommittedCards
);

// One Committed Card, as its Scryfall card id, with the names of the other Users it is committed with.
public record CommittedCardResponse(
    string CardId,
    IEnumerable<string> CommittedWith
);
