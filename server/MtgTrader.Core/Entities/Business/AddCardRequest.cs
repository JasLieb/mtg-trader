namespace MtgTrader.Core.Entities.Business;

public record class AddCardRequest(
    string CardId,
    string WantlistId
);
