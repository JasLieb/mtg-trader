namespace MtgTrader.Core.Entities.General;

public class TradeProposal(
    string id,
    string proposerId,
    string recipientId,
    DateTime sentAt,
    TradeProposalState state
)
{
    public string Id { get; set; } = id;
    public string ProposerId { get; set; } = proposerId;
    public string RecipientId { get; set; } = recipientId;
    public DateTime SentAt { get; set; } = sentAt;
    public TradeProposalState State { get; set; } = state;
    // When the proposal stopped being pending: accepted, declined or withdrawn. Null while pending.
    public DateTime? RespondedAt { get; set; }
    // When each User went through "Remove these cards from my lists" on this Trade. Null until they do.
    public DateTime? ProposerRemovedCardsAt { get; set; }
    public DateTime? RecipientRemovedCardsAt { get; set; }

    public ICollection<TradeProposalCard> Cards { get; set; } = [];

    // Whether this User has gone through "Remove these cards from my lists" on this Trade.
    // False for a User who is neither its proposer nor its recipient.
    public bool HasRemovedCards(string userId) =>
        (userId == ProposerId ? ProposerRemovedCardsAt
            : userId == RecipientId ? RecipientRemovedCardsAt
            : null) is not null;
}

public enum TradeProposalState
{
    Pending,
    Accepted,
    Declined,
    Withdrawn,
    // Never stored: a proposal still Pending in the database is reported Expired once its delay has
    // passed, which TradeProposalHandler.CurrentState works out from SentAt each time it is read.
    Expired,
}
