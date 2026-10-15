using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IUserRepository : IBaseRepository<User>
{
    User? GetByUserId(string userId);
    IEnumerable<User> GetByUserIds(IEnumerable<string> userIds);
    User? GetByUsername(string username);
    User? CreateWithDoubles(User user, Wantlist doubles);
}
