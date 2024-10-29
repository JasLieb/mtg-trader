namespace MtgTrader.Core.Repositories;

public interface IBaseRepository<T> where T : class
{
    IEnumerable<T> GetAll();
    T GetById<Tid>(Tid id);
    bool IsExists<Tvalue>(string key, Tvalue value);
    T Create(T model);
    void Update(T model);
    void Delete(T model);
}