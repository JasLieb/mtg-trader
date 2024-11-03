using System.Net;
using System.Security.Cryptography.X509Certificates;
using MtgTrader.Infrastructure.Configuration;

namespace MtgTrader.WebApi.Extensions;

public static class ConfigurationExtensions
{
    private static readonly string _certPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ssl", "ssl.crt");
    private static readonly string _keyPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ssl", "ssl.key");
    public static WebApplicationBuilder RegisterConfiguration(this WebApplicationBuilder builder)
    {
        builder.Configuration[JwtConstants.Secret] =
            Environment.GetEnvironmentVariable(JwtConstants.EnvSecret)
            ?? builder.Configuration[JwtConstants.Secret];

        builder.Configuration[PgConstants.Host] =
            Environment.GetEnvironmentVariable(PgConstants.EnvHost)
            ?? builder.Configuration[PgConstants.Host];
        return builder;
    }

    public static WebApplicationBuilder RegisterHttpsRedirection(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsDevelopment())
        {
            builder.Services.AddHttpsRedirection(options =>
            {
                options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
                options.HttpsPort = 7175;
            });
            builder.WebHost.UseKestrel(
                options =>
                options.Listen(IPAddress.Any, 7175, listenOptions =>
                    listenOptions.UseHttps(
                        X509Certificate2.CreateFromPemFile(_certPath, _keyPath)
                    )
                )
            );
        }
        return builder;
    }
}
