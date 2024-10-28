namespace MtgTrader.Core.Entities.General;

public record class User(
    string Id,
    string UserName,
    string Password
);
