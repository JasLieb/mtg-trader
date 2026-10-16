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
        var doubleCards = doubles?.Cards ?? [];

        // Trade partners run both ways: users holding doubles I want, and users wanting my doubles.
        var tradeableWantlists = _wantlistRepository.FindTradeableDoubles(userId, wantedWantlists);
        var usersWantingMyDoubles = _wantlistRepository.FindUserIdsWantingCards(
            userId,
            doubleCards.Select(c => c.CardId)
        );
        return new([
            .. MakeTradeableResponseContent(
                tradeableWantlists,
                usersWantingMyDoubles,
                wantedWantlists.SelectMany(w => w.Cards),
                doubleCards
            )
        ]);
    }

    private IEnumerable<UserTradeResponse> MakeTradeableResponseContent(
        IEnumerable<Entities.General.Wantlist> wantlists,
        IEnumerable<string> usersWantingMyDoubles,
        IEnumerable<Entities.General.WantlistCards> wantedCards,
        IEnumerable<Entities.General.WantlistCards> doubleCards
    )
    {
        var doublesByTraders = wantlists
            .GroupBy(w => w.OwnerId)
            .ToDictionary(group => group.Key, group => group.ToList());
        var traderIds = doublesByTraders.Keys.Union(usersWantingMyDoubles).ToList();
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

        foreach (var traderId in traderIds)
        {
            if (traders.TryGetValue(traderId, out var user))
            {
                var wantedTrade = wantedByTraders.GetValueOrDefault(user.Id) ?? [];
                // A user who only wants my doubles holds none I want, so this side stays empty for them.
                var traderDoubles = doublesByTraders.GetValueOrDefault(user.Id) ?? [];

                yield return new UserTradeResponse(
                    user.Id,
                    user.Username,
                    traderDoubles.SelectMany(w => w.Cards)
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
