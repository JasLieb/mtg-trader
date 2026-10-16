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

    public ICollection<TradeProposalCard> Cards { get; set; } = [];
}

public enum TradeProposalState
{
    Pending,
    Accepted,
    Declined,
    Withdrawn,
}
