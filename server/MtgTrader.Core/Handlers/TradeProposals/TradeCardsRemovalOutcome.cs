namespace MtgTrader.Core.Handlers.TradeProposals;

// What became of a request to remove a Trade's Cards from the user's lists.
public enum TradeCardsRemovalOutcome
{
    Done,
    // No such proposal, or the user is neither its proposer nor its recipient.
    NotFound,
    // The proposal is not an accepted Trade.
    NotATrade,
    // The user has already gone through the step on this Trade.
    AlreadyDone,
    // A Card sent is not one of the Trade's Cards, on the side where the request puts it.
    NotTradeCards,
    // The Trade or the user's lists changed while the step was being written, for instance through
    // a concurrent submission of the same step. Nothing was written.
    Conflict,
}
