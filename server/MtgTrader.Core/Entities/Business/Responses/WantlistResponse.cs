namespace MtgTrader.Core.Entities.Business.Responses;

public record class WantlistResponse(
    string Id,
    string Name,
    IEnumerable<string> CardIds
);
