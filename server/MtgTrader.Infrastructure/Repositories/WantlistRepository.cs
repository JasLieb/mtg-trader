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

    public IEnumerable<Wantlist> GetUsersWantlists(IEnumerable<string> userIds)
    {
        var ids = userIds.ToList();
        return [.. DbSet.Where(x => ids.Contains(x.OwnerId)).Include(x => x.Cards)];
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
        var wantedCardIds = wantedWantlists
            .SelectMany(wantlist => wantlist.Cards)
            .Select(card => card.CardId)
            .Distinct()
            .ToList();
        // DoublesList.IsDoublesListId can't be translated to SQL, so the query tests the suffix itself.
        return [
            .. DbSet.Where(wl =>
                wl.OwnerId != ownerId
                && wl.Id.EndsWith(DoublesList.IdSuffix)
                && wl.Cards.Any(card => wantedCardIds.Contains(card.CardId))
            )
            .Include(wl => wl.Cards)
        ];
    }
}
