namespace MtgTrader.Core.Handlers.TradeProposals;

// What became of an accept, decline or withdraw request.
public enum TradeProposalActionOutcome
{
    Done,
    // No such proposal, or the user is neither its proposer nor its recipient.
    NotFound,
    // The user is a party to the proposal but not the one who may take this action.
    NotAllowed,
    // The proposal is no longer pending, possibly because another action was written first.
    NotPending,
    // Acceptance only: some Cards are no longer in the Doubles list of the User who gives them.
    MissingCards,
}

public record TradeProposalActionResult(TradeProposalActionOutcome Outcome)
{
    public IEnumerable<string> MissingCards { get; init; } = [];
}
