namespace MtgTrader.Core.Repositories;

public interface IBaseRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAll();
    Task<T> GetById<Tid>(Tid id);
    Task<bool> IsExists<Tvalue>(string key, Tvalue value);
    Task<T> Create(T model);
    Task Update(T model);
    Task Delete(T model);
    Task SaveChangeAsync();
}
