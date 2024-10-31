namespace MtgTrader.Core.Entities.Business.Requests;

public record class AuthRequest(
    string Email,
    string Password
);
