using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class UserRepository(ApplicationContext dbContext)
    : BaseRepository<User>(dbContext), IUserRepository
{
    public User? GetByUserId(string userId)
    {
        return DbSet.Where(user => user.Id == userId)
            .FirstOrDefault();
    }

    public User? GetByUsername(string username)
    {
        return DbSet.Where(user => user.Username == username)
            .FirstOrDefault();
    }
}
