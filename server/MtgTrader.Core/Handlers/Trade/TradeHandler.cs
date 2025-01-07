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
        var allWantlists = _wantlistRepository
            .GetUserWantlists(userId);
        var doubles = allWantlists
            .FirstOrDefault(wl => wl.Id.EndsWith("_doubles"));
        var wantedWantlists = allWantlists
            .Where(wl => !wl.Id.EndsWith("_doubles"));

        var tradeableWantlists = _wantlistRepository.FindTradeableDoubles(userId, wantedWantlists);
        return new(
            MakeTradeableResponseContent(
                tradeableWantlists,
                wantedWantlists.SelectMany(w => w.Cards),
                doubles?.Cards ?? []  
            )
            .ToList()
        );
    }

    private IEnumerable<UserTradeResponse> MakeTradeableResponseContent(
        IEnumerable<Entities.General.Wantlist> wantlists,
        IEnumerable<Entities.General.WantlistCards> wantedCards,
        IEnumerable<Entities.General.WantlistCards> doubleCards
    )
    {
        var groupedByUsers = wantlists.GroupBy(w => w.OwnerId);
        foreach (var wantlist in groupedByUsers)
        {
            var user = _userRepository.GetByUserId(wantlist.Key);
            if (user is not null)
            {
                var wantedTrade = _wantlistRepository.GetUserWantlists(user.Id);

                yield return new UserTradeResponse(
                    user.Id,
                    user.Username,
                    wantlist.SelectMany(w => w.Cards)
                        .Select(c => c.CardId)
                        .Distinct()
                        .Where(c => wantedCards.Any(wc => wc.CardId.Equals(c))),
                    doubleCards
                        .Where(c => 
                            wantedTrade.SelectMany(wt => wt.Cards)
                                .Select(wc => wc.CardId)
                                .Contains(c.CardId)
                        )
                        .Distinct()
                        .Select(c => c.CardId)
                );
            }
        }
    }
}
