using MtgTrader.Core.Entities.Business.Requests;

namespace MtgTrader.Core.Handlers.Wantlist;

public interface IWantlistHandler
{
    Entities.General.Wantlist? UpdateWantlist(UpdateWantlistRequest wantlistRequest, string userId);
    Entities.General.Wantlist CreateWantlist(CreateWantlistRequest request, string userId);
    Entities.Business.Responses.WantlistsResponse GetWantlists(string userId);
    bool DeleteWantlist(string wantlistId, string userId);
}
