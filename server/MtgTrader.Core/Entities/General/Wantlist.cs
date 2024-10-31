namespace MtgTrader.Core.Entities.General;

public class Wantlist(
    string id,
    string name,
    string ownerId
)
{
    public string Id { get; set; } = id;
    public string Name { get; set; } = name;
    public string OwnerId { get; set; } = ownerId;
    
    public ICollection<WantlistCards> Cards { get; set; } = [];
}
