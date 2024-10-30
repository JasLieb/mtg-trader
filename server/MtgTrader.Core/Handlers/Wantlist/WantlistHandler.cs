using MtgTrader.Core.Entities.Business;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Wantlist;

public class WantlistHandler(
    IWantlistRepository wantlistRepository,
    IWantlistCardsRepository wantlistCardsRepository
) : IWantlistHandler
{
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;
    private readonly IWantlistCardsRepository _wantlistCardsRepository = wantlistCardsRepository;

    public Entities.General.Wantlist AddCard(AddCardRequest addCardRequest)
    {
        _wantlistCardsRepository.Create(new Entities.General.WantlistCards(
            addCardRequest.WantlistId,
            addCardRequest.CardId
        ));
        return _wantlistRepository.GetById(addCardRequest.WantlistId);
    }

    public Entities.General.Wantlist CreateWantlist(CreateWantlistRequest request)
    {
        return _wantlistRepository.Create(
            new Entities.General.Wantlist(
            Guid.NewGuid().ToString(), 
            request.WantlistName, 
            request.OwnerId
        )
        );
    }
}
