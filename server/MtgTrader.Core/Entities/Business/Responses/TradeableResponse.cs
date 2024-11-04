namespace MtgTrader.Core.Entities.Business.Responses;

public record TradeableResponse(
    IEnumerable<UserTradeResponse> Users
);
