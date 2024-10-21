namespace MtgTrader.Core.Auth.Domain;

public record class User(
    string Id,
    string UserName,
    string Password
);
