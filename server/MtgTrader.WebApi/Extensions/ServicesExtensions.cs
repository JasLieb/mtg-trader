using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MtgTrader.Core.Handlers.Auth;
using MtgTrader.Core.Handlers.Chat;
using MtgTrader.Core.Handlers.Trade;
using MtgTrader.Core.Handlers.Wantlist;
using MtgTrader.Core.Repositories;
using MtgTrader.Core.Services;
using MtgTrader.Infrastructure.Configuration;
using MtgTrader.Infrastructure.Contexts;
using MtgTrader.Infrastructure.Repositories;
using MtgTrader.Infrastructure.Services;

namespace MtgTrader.WebApi.Extensions;

public static class ServicesExtensions
{
    public const string CorsPolicyName = "SignalRCorsPolicy";

    public static IServiceCollection RegisterServices(this IServiceCollection services) =>
        services
            .AddTransient<ITokenService, JwtTokenService>()
            .AddTransient<IUserRepository, UserRepository>()
            .AddTransient<IWantlistRepository, WantlistRepository>()
            .AddTransient<IWantlistCardsRepository, WantlistCardsRepository>()
            .AddTransient<IChatRepository, ChatRepository>()
            .AddScoped<IAuthHandler, AuthHandler>()
            .AddScoped<IWantlistHandler, WantlistHandler>()
            .AddScoped<ITradeHandler, TradeHandler>()
            .AddScoped<IChatHandler, ChatHandler>();

    public static IServiceCollection RegisterInfrastructure(
        this IServiceCollection services,
        ConfigurationManager configuration
    )
    {
        services.AddCors(options =>
            options.AddPolicy(
                name: CorsPolicyName,
                policy => policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
            )
        );
        services.AddSignalR();
        services.AddControllers();
        services.AddDbContext<ApplicationContext>(
            opt =>
                opt.UseNpgsql(GetConnectionString(configuration))
        );
        return services;
    }

    public static IServiceCollection RegisterAuthentification(
        this IServiceCollection services,
        ConfigurationManager configuration
    )
    {
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration[JwtConstants.Issuer],
                    ValidAudience = configuration[JwtConstants.Audience],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            configuration[JwtConstants.Secret]
                            ?? throw new InvalidOperationException("Unknown JWT secret")
                        )
                    ),
                    ClockSkew = TimeSpan.Zero
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        var path = context.HttpContext.Request.Path;
                        if (
                            !string.IsNullOrEmpty(accessToken) 
                            && path.StartsWithSegments("/chatHub")
                        )
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });
        return services;
    }

    public static IServiceCollection RegisterSwagger(this IServiceCollection services)
    {
        // Add services to the container.
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new() { Title = "Mtg Trader API", Version = "v1" });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement()
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header,
                    },
                    new List<string>()
                }
            });
            c.AddSignalRSwaggerGen();
        });
        return services;
    }

    private static string GetConnectionString(ConfigurationManager configuration)
    {
        var str = $"Server={configuration[PgConstants.Host]};Port={configuration[PgConstants.Port]};Database={configuration[PgConstants.Db]};UserName={configuration[PgConstants.User]};Password={configuration[PgConstants.Password]}";
        return str;
    }
}