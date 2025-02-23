using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Services;

public interface ITokenService
{
    string CreateToken(User user);
    string? CheckToken(string token);
}
