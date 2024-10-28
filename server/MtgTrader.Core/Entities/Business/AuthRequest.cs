namespace MtgTrader.Core.Entities.Business;

public record class AuthRequest(
    string Email,
    string Password
);
