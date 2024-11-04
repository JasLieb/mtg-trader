using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class WantlistRepository(ApplicationContext dbContext)
    : BaseRepository<Wantlist>(dbContext), IWantlistRepository
{
    public IEnumerable<Wantlist> GetUserWantlists(string userId)
    {
        return [.. DbSet.Where(x => x.OwnerId == userId).Include(x => x.Cards)];
    }

    public bool IsWantlistExist(string wantlistId)
    {
        return DbSet.Any(x => x.Id == wantlistId);
    }

    public IEnumerable<Wantlist> FindTradeableDoubles(
        string ownerId,
        IEnumerable<Wantlist> wantedWantlists
    )
    {
        var dbSet = DbSet.Where(wl => 
            wl.OwnerId != ownerId
            && wl.Id.Contains("_doubles")
        )
        .Include(wl => wl.Cards)
        .ToList();
        return wantedWantlists.SelectMany(
            wantedWantlist =>
                dbSet
                .Where(
                    targetWantlist => ContainsCardsFrom(
                        targetWantlist,
                        wantedWantlist
                    )
                )
        )
        .ToList();
    }

    private bool ContainsCardsFrom(Wantlist targetWantlist, Wantlist originWantlist) =>
        targetWantlist.Cards
            .Select(wc => wc.CardId)
            .Any(
                originWantlist.Cards.Select(wc => wc.CardId).Contains
            );
}
