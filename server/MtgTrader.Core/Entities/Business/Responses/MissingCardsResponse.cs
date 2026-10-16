namespace MtgTrader.Core.Entities.Business.Responses;

// Why an acceptance was refused: the proposal's Cards, from either side, that are no longer
// in the Doubles list of the User who gives them. The proposal stays pending.
public record MissingCardsResponse(
    IEnumerable<string> MissingCards
);
