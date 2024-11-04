using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Wantlist;

public class WantlistHandler(
    IWantlistRepository wantlistRepository,
    IWantlistCardsRepository wantlistCardsRepository
) : IWantlistHandler
{
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;
    private readonly IWantlistCardsRepository _wantlistCardsRepository = wantlistCardsRepository;

    public Entities.General.Wantlist? UpdateWantlist(UpdateWantlistRequest wantlistRequest)
    {
        if(!_wantlistRepository.IsWantlistExist(wantlistRequest.WantlistId))
            return null;

        _wantlistCardsRepository.UpdateWantlist(
            wantlistRequest.WantlistId,
            wantlistRequest.Cards
        );
        return _wantlistRepository.GetById(wantlistRequest.WantlistId);
    }

    public Entities.General.Wantlist CreateWantlist(
        CreateWantlistRequest request,
        string userId
    )
    {
        return _wantlistRepository.Create(
            new Entities.General.Wantlist(
                Guid.NewGuid().ToString(), 
                request.WantlistName, 
                userId
            )
        );
    }

    public IEnumerable<WantlistResponse> GetWantlists(string userId)
    {
        return _wantlistRepository.GetUserWantlists(userId)
            .Select(
                originalWl => new WantlistResponse(
                    originalWl.Id,
                    originalWl.Name,
                    originalWl.Cards.Select(c => c.CardId)
                )
            );
    }

    public void DeleteWantlist(string wantlistId)
    {
        if(IsDoubleWantlist(wantlistId)) return;
        var wantlist = _wantlistRepository.GetById(wantlistId);
        if(wantlist != null) {
            var cards = _wantlistCardsRepository.GetCards(wantlist.Id);

            foreach (var card in cards)
                _wantlistCardsRepository.Delete(card);

            _wantlistRepository.Delete(wantlist);
        }
    }

    private bool IsDoubleWantlist(string wantlistId)
    {
        return wantlistId.EndsWith("_doubles");
    }
}
