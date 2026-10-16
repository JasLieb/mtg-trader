using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IWantlistRepository : IBaseRepository<Wantlist>
{
    bool IsWantlistExist(string wantlistId);
    IEnumerable<Wantlist> GetUserWantlists(string userId);
    IEnumerable<Wantlist> GetUsersWantlists(IEnumerable<string> userIds);
    IEnumerable<Wantlist> FindTradeableDoubles(
        string ownerId,
        IEnumerable<Wantlist> expectedWantlists
    );
    IEnumerable<string> FindUserIdsWantingCards(
        string userId,
        IEnumerable<string> cardIds
    );
}
