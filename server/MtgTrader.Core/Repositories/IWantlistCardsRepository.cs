using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IWantlistCardsRepository : IBaseRepository<WantlistCards>
{
    void UpdateWantlist(string wantlistId, IEnumerable<string> cards);
}
