using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Wantlist;

public class WantlistHandler(
    IWantlistRepository wantlistRepository,
    IWantlistCardsRepository wantlistCardsRepository
) : IWantlistHandler
{
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;
    private readonly IWantlistCardsRepository _wantlistCardsRepository = wantlistCardsRepository;

    public Entities.General.Wantlist? UpdateWantlist(UpdateWantlistRequest wantlistRequest, string userId)
    {
        var wantlist = _wantlistRepository.GetById(wantlistRequest.WantlistId);
        if (wantlist is null || wantlist.OwnerId != userId)
            return null;

        _wantlistCardsRepository.UpdateWantlist(
            wantlistRequest.WantlistId,
            wantlistRequest.Cards
        );
        return wantlist;
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

    public WantlistsResponse GetWantlists(string userId)
    {
        return new(
            _wantlistRepository.GetUserWantlists(userId)
            .Select(
                originalWl => new WantlistResponse(
                    originalWl.Id,
                    originalWl.Name,
                    originalWl.Cards.Select(c => c.CardId)
                )
            )
        );
    }

    public bool DeleteWantlist(string wantlistId, string userId)
    {
        if (DoublesList.IsDoublesListId(wantlistId)) return false;
        var wantlist = _wantlistRepository.GetById(wantlistId);
        if (wantlist is null || wantlist.OwnerId != userId) return false;

        var cards = _wantlistCardsRepository.GetCards(wantlist.Id);

        foreach (var card in cards)
            _wantlistCardsRepository.Delete(card);

        _wantlistRepository.Delete(wantlist);
        return true;
    }
}
