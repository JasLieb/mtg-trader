using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Trade;

public class TradeHandler(
    IWantlistRepository wantlistRepository, 
    IUserRepository userRepository
) : ITradeHandler
{
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;
    private readonly IUserRepository _userRepository = userRepository;

    public TradeableResponse FindTrades(string userId)
    {
        var wantlists = _wantlistRepository.GetUserWantlists(userId);
        var tradeableWantlists = _wantlistRepository.FindTradeableDoubles(userId, wantlists);
        return new(
            MakeTradeableResponseContent(
                tradeableWantlists
            )
            .ToList()
        );
    }

    private IEnumerable<UserTradeResponse> MakeTradeableResponseContent(
        IEnumerable<Entities.General.Wantlist> wantlists
    )
    {
        foreach(var wantlist in wantlists)
        {
            var user = _userRepository.GetByUserId(wantlist.OwnerId);
            if(user is not null)
                yield return new UserTradeResponse(
                    user.Id, 
                    user.Username, 
                    new WantlistResponse(
                        wantlist.Id, 
                        wantlist.Name, 
                        wantlist.Cards.Select(c => c.CardId)
                    )
                );

        }
    }
}
