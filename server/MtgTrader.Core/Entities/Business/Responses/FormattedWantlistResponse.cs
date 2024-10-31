namespace MtgTrader.Core.Entities.Business.Responses;

public record class FormattedWantlistResponse(
    string Id,
    string Name,
    IEnumerable<string> CardIds
);
