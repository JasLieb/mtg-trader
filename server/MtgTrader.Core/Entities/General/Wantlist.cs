namespace MtgTrader.Core.Entities.General;

public class Wantlist
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public User? Owner { get; set; } = null;

    public ICollection<WantlistCards> Cards { get; set; } = [];
}
