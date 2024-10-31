namespace MtgTrader.Core.Entities.General;

public class WantlistCards(
    string wantlistId,
    string cardId
)
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string WantlistId { get; set; } = wantlistId;
    public string CardId { get; set; } = cardId;
    
    public Wantlist? WantlistOrigin { get; set; }
}
