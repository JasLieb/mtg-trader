using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class UserRepository(ApplicationContext dbContext) 
    : BaseRepository<User>(dbContext), IUserRepository
{
}
