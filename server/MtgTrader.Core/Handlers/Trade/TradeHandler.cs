using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;
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
        var allWantlists = _wantlistRepository
            .GetUserWantlists(userId);
        var doubles = allWantlists
            .FirstOrDefault(DoublesList.IsDoublesList);
        var wantedWantlists = allWantlists
            .Where(wl => !DoublesList.IsDoublesList(wl));

        var tradeableWantlists = _wantlistRepository.FindTradeableDoubles(userId, wantedWantlists);
        return new([
            .. MakeTradeableResponseContent(
                tradeableWantlists,
                wantedWantlists.SelectMany(w => w.Cards),
                doubles?.Cards ?? []
            )
        ]);
    }

    private IEnumerable<UserTradeResponse> MakeTradeableResponseContent(
        IEnumerable<Entities.General.Wantlist> wantlists,
        IEnumerable<Entities.General.WantlistCards> wantedCards,
        IEnumerable<Entities.General.WantlistCards> doubleCards
    )
    {
        var groupedByUsers = wantlists.GroupBy(w => w.OwnerId).ToList();
        var traderIds = groupedByUsers.Select(group => group.Key).ToList();
        var traders = _userRepository.GetByUserIds(traderIds)
            .ToDictionary(user => user.Id);
        // What each trader wants is in their wantlists, not in their own doubles list.
        var wantedByTraders = _wantlistRepository.GetUsersWantlists(traderIds)
            .Where(wl => !DoublesList.IsDoublesList(wl))
            .GroupBy(wl => wl.OwnerId)
            .ToDictionary(
                group => group.Key,
                group => group.SelectMany(wl => wl.Cards).Select(wc => wc.CardId).ToHashSet()
            );

        foreach (var wantlist in groupedByUsers)
        {
            if (traders.TryGetValue(wantlist.Key, out var user))
            {
                var wantedTrade = wantedByTraders.GetValueOrDefault(user.Id) ?? [];

                yield return new UserTradeResponse(
                    user.Id,
                    user.Username,
                    wantlist.SelectMany(w => w.Cards)
                        .Select(c => c.CardId)
                        .Distinct()
                        .Where(c => wantedCards.Any(wc => wc.CardId.Equals(c))),
                    doubleCards
                        .Where(c => wantedTrade.Contains(c.CardId))
                        .Distinct()
                        .Select(c => c.CardId)
                );
            }
        }
    }
}
