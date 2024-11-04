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
                tradeableWantlists.GroupBy(wl => wl.OwnerId)
            )
            .ToList()
        );
    }

    private IEnumerable<UserResponse> MakeTradeableResponseContent(
        IEnumerable<IGrouping<string, Entities.General.Wantlist>> wantlistsGroupByUserId
    )
    {
        foreach(var groupBy in wantlistsGroupByUserId)
        {
            var user = _userRepository.GetByUserId(groupBy.Key);
            if(user is not null)
                yield return new UserResponse(
                    user.Id, 
                    user.Username, 
                    groupBy.Select(wl => new WantlistResponse(wl.Id, wl.Name, wl.Cards.Select(c => c.CardId)))
                );

        }
    }
}
