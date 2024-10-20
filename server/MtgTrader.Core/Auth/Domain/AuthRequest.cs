namespace MtgTrader.Core.Auth.Domain;

public record class AuthRequest(
    string Email,
    string Password
);
