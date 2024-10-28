using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MtgTrader.Core.Handlers.Auth;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Configuration;
using MtgTrader.Infrastructure.Contexts;
using MtgTrader.Infrastructure.Repositories;
using MtgTrader.Infrastructure.Services.JwtToken;

namespace MtgTrader.WebApi.Extensions;

public static class ServicesExtensions
{
    public static IServiceCollection RegisterServices(this IServiceCollection services) =>
        services
            .AddTransient<IJwtTokenService, JwtTokenService>()
            .AddTransient<IUserRepository, UserRepository>()
            .AddScoped<IAuthHandler, AuthHandler>();

    public static IServiceCollection RegisterInfrastructure(
        this IServiceCollection services,
        ConfigurationManager configuration
    ){
        services.AddControllers();
        services.AddDbContextPool<ApplicationContext>(
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
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
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
        });
        return services;
    }

    private static string GetConnectionString(ConfigurationManager configuration)
    {
        var str = $"Server={configuration["PG:Host"]};Port={configuration["PG:Port"]};Database={configuration["PG:Db"]};UserName={configuration["PG:User"]};Password={configuration["PG:Password"]}";
        return str;
    }
}