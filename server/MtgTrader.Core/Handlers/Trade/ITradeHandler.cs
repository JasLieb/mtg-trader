using MtgTrader.Core.Entities.Business.Responses;

namespace MtgTrader.Core.Handlers.Trade;

public interface ITradeHandler
{
    TradeableResponse FindTrades(string userId);
}
