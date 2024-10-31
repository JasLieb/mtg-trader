using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IWantlistRepository : IBaseRepository<Wantlist>
{
    IEnumerable<Wantlist> GetUserWantlists(string userId);
}
