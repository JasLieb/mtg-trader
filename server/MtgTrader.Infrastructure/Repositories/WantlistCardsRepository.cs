using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class WantlistCardsRepository(ApplicationContext dbContext)
    : BaseRepository<WantlistCards>(dbContext), IWantlistCardsRepository
{
    public void UpdateWantlist(string wantlistId, IEnumerable<string> cards)
    {
        var wantlists = DbSet.Where(wc => wc.WantlistId == wantlistId).ToList();
        var cardsToRemove = wantlists.Where(wc => !cards.Contains(wc.CardId));
        foreach(var wantlistCard in cardsToRemove)
            Delete(wantlistCard);

        foreach(var cardId in cards)
        {
            var wlContainsCard = wantlists.Any(wc => wc.CardId == cardId);
            if(!wlContainsCard)
                Create(new(wantlistId, cardId));
        }
    }
}
