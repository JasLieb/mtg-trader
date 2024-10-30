using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class WantlistCardsRepository(ApplicationContext dbContext)
    : BaseRepository<WantlistCards>(dbContext), IWantlistCardsRepository
{

}
