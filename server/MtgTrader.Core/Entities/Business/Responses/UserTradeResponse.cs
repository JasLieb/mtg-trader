namespace MtgTrader.Core.Entities.Business.Responses;

public record class UserTradeResponse(
    string Id,
    string Name,
    IEnumerable<string> Doubles,
    IEnumerable<string> Wanted
);
