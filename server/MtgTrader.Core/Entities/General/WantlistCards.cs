namespace MtgTrader.Core.Entities.General;

public class WantlistCards
{
    public string Id { get; set; } = string.Empty;
    public string Wantlist { get; set; } = string.Empty;
    public string Card { get; set; } = string.Empty;
    
    public Wantlist? WantlistOrigin { get; set; }
    public Card? CardOrigin { get; set; }
}
