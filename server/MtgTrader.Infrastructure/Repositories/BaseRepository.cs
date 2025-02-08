using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Infrastructure.Repositories;

public class BaseRepository<T>(DbContext dbContext) : IBaseRepository<T> where T : class
{
    private readonly DbContext _dbContext = dbContext;
    protected DbSet<T> DbSet => _dbContext.Set<T>();

    public IEnumerable<T> GetAll()
    {
        return [.. _dbContext.Set<T>().AsNoTracking()];
    }

    public T? GetById<Tid>(Tid id)
    {
        var data = _dbContext.Set<T>().Find(id);
        return data;
    }

    public bool IsExists<Tvalue>(string key, Tvalue value)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.Property(parameter, key);
        var constant = Expression.Constant(value);
        var equality = Expression.Equal(property, constant);
        var lambda = Expression.Lambda<Func<T, bool>>(equality, parameter);

        return _dbContext.Set<T>().Any(lambda);
    }

    public T Create(T model)
    {
        _dbContext.Set<T>().Add(model);
        _dbContext.SaveChanges();
        return model;
    }

    public void Update(T model)
    {
        _dbContext.Set<T>().Update(model);
        _dbContext.SaveChanges();
    }

    public void Delete(T model)
    {
        _dbContext.Set<T>().Remove(model);
        _dbContext.SaveChanges();
    }
}
