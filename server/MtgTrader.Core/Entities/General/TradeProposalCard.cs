namespace MtgTrader.Core.Entities.General;

public class TradeProposalCard(
    string tradeProposalId,
    string cardId,
    TradeProposalSide givenBy
)
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TradeProposalId { get; set; } = tradeProposalId;
    public string CardId { get; set; } = cardId;
    public TradeProposalSide GivenBy { get; set; } = givenBy;
}

public enum TradeProposalSide
{
    Proposer,
    Recipient,
}
