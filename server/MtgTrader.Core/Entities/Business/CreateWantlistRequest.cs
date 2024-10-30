namespace MtgTrader.Core.Entities.Business;

public record class CreateWantlistRequest(
    string WantlistName,
    string? OwnerId
);
