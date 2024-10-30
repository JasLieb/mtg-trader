using MtgTrader.Core.Entities.Business;

namespace MtgTrader.Core.Handlers.Wantlist;

public interface IWantlistHandler
{
    Entities.General.Wantlist AddCard(AddCardRequest addCardRequest);
    Entities.General.Wantlist CreateWantlist(CreateWantlistRequest request);
}
