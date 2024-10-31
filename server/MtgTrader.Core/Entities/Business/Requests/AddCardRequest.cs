namespace MtgTrader.Core.Entities.Business.Requests;

public record class UpdateWantlistRequest(
    string WantlistId,
    IEnumerable<string> Cards
);
