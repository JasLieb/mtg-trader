namespace MtgTrader.Core.Entities.Business.Requests;

// "Remove these cards from my lists" on a Trade, seen from the user: the Trade's GivenCards to take out
// of their Doubles list and ReceivedCards to take out of their Wantlists. Cards left unchecked are not sent.
public record class RemoveTradeCardsRequest(
    IEnumerable<string> GivenCards,
    IEnumerable<string> ReceivedCards
);
