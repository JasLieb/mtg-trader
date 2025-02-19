namespace MtgTrader.Core.Entities.Business.Responses;

public record class WantlistsResponse(
    IEnumerable<WantlistResponse> Wantlists
);

public record class WantlistResponse(
    string Id,
    string Name,
    IEnumerable<string> Cards
);
