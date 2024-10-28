using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MtgTrader.Core.Entities.General;
using Config = MtgTrader.Infrastructure.Configuration;

namespace MtgTrader.Infrastructure.Services.JwtToken;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    private readonly IConfiguration _configuration = configuration;

    public string CreateToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(GetConfiguration(Config.JwtConstants.Secret));
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, user.Id)
                ]
            ),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            ),
            Issuer = GetConfiguration(Config.JwtConstants.Issuer),
            Audience = GetConfiguration(Config.JwtConstants.Audience)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string GetConfiguration(string key)
    {
        var value = _configuration[key];
        if(string.IsNullOrEmpty(value)) 
            throw new ArgumentNullException(nameof(key));
        return value;
    }
        
}
