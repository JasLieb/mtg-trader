using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Services;
using Config = MtgTrader.Infrastructure.Configuration;

namespace MtgTrader.Infrastructure.Services;

public class JwtTokenService(IConfiguration configuration) : ITokenService
{
    private readonly IConfiguration _configuration = configuration;

    public string? CheckToken(string token)
    {
        var key = Encoding.ASCII.GetBytes(GetConfiguration(Config.JwtConstants.Secret));
        var signingKeys = new SymmetricSecurityKey(key);
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = GetConfiguration(Config.JwtConstants.Issuer),
            ValidateAudience = true,
            ValidAudience = GetConfiguration(Config.JwtConstants.Audience),
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKeys,
            ValidateLifetime = true
        };

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var claimsPrincipal = tokenHandler.ValidateToken(
                token.Replace("Bearer ", ""),
                validationParameters,
                out _
            );
            return claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        catch (Exception e)
        when (e is SecurityTokenValidationException or SecurityTokenMalformedException)
        {
            return null;
        }
    }

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
        if (string.IsNullOrEmpty(value))
            throw new ArgumentNullException(nameof(key));
        return value;
    }

}
