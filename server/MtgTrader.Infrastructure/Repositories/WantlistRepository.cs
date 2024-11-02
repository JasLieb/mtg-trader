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
}
