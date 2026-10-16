using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;
using Npgsql;

namespace MtgTrader.Infrastructure.Repositories;

public class UserRepository(ApplicationContext dbContext)
    : BaseRepository<User>(dbContext), IUserRepository
{
    public User? GetByUserId(string userId)
    {
        return DbSet.Where(user => user.Id == userId)
            .FirstOrDefault();
    }

    public IEnumerable<User> GetByUserIds(IEnumerable<string> userIds)
    {
        var ids = userIds.ToList();
        return [.. DbSet.Where(user => ids.Contains(user.Id))];
    }

    public User? GetByUsername(string username)
    {
        // Accounts created before emails were normalized may hold mixed-case usernames.
        return DbSet.Where(user => user.Username.ToLower() == username.ToLower())
            .FirstOrDefault();
    }

    public User? CreateWithDoubles(User user, Wantlist doubles)
    {
        DbSet.Add(user);
        Context.Set<Wantlist>().Add(doubles);
        try
        {
            Context.SaveChanges();
            return user;
        }
        catch (DbUpdateException e)
        when (e.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Another registration took this username between the caller's check and this insert.
            return null;
        }
    }
}
