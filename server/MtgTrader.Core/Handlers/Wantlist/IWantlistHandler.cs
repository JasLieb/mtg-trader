using MtgTrader.Core.Entities.Business.Requests;

namespace MtgTrader.Core.Handlers.Wantlist;

public interface IWantlistHandler
{
    Entities.General.Wantlist? UpdateWantlist(UpdateWantlistRequest wantlistRequest);
    Entities.General.Wantlist CreateWantlist(CreateWantlistRequest request, string userId);
    Entities.Business.Responses.WantlistsResponse GetWantlists(string userId);
    void DeleteWantlist(string wantlistId);
}
