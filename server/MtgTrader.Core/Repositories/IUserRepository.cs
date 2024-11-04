using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IUserRepository: IBaseRepository<User>
{
    User? GetByUserId(string userId);
    User? GetByUsername(string username);
}
