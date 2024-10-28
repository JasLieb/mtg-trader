using MtgTrader.Infrastructure.Configuration;

namespace MtgTrader.WebApi.Extensions;

public static class ConfigurationExtensions
{
    public static WebApplicationBuilder RegisterConfiguration(this WebApplicationBuilder builder)
    {
        builder.Configuration[JwtConstants.Secret] = Environment.GetEnvironmentVariable(JwtConstants.EnvSecret) ?? builder.Configuration[JwtConstants.Secret];
        builder.Configuration[PgConstants.EnvHost] = Environment.GetEnvironmentVariable(PgConstants.EnvHost) ?? builder.Configuration[PgConstants.Host];
        return builder;
    }
}
