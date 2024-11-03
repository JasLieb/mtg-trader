using MtgTrader.Core.Entities.General;

namespace MtgTrader.Infrastructure.Services.JwtToken;

public interface IJwtTokenService
{
    string CreateToken(User user);
    bool CheckToken(string token);
}
