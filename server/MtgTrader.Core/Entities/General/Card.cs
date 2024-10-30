namespace MtgTrader.Core.Entities.General;

public class Card(string id)
{
    public string Id { get; set; } = id;
    public ICollection<WantlistCards> ReferencedInWantlists { get; set; } = [];
}
