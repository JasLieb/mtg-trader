using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IWantlistRepository : IBaseRepository<Wantlist>
{
    bool IsWantlistExist(string wantlistId);
    IEnumerable<Wantlist> GetUserWantlists(string userId);
    IEnumerable<Wantlist> FindTradeableDoubles(
        string ownerId,
        IEnumerable<Wantlist> expectedWantlists
    );
}
