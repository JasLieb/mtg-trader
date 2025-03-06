namespace MtgTrader.Infrastructure.Configuration;

public static class EnvConstants
{
    public const string EnvPort = "PORT";
    public const string Port = "ENV:Port";
    public const string EnvUseHttps = "USE_HTTPS";
    public const string UseHttps = "ENV:UseHttps";
}

public static class PgConstants
{
    public const string EnvHost = "PG_HOST";
    public const string Host = "PG:Host";
    public const string EnvPort = "PG_PORT";
    public const string Port = "PG:Port";
    public const string EnvDbName = "PG_DATABASE";
    public const string DbName = "PG:Db";
    public const string EnvUser = "PG_USER";
    public const string User = "PG:User";
    public const string EnvPassword = "PG_PASSWORD";
    public const string Password = "PG:Password";
}

public static class JwtConstants
{
    public const string EnvSecret = "JWT_SECRET";
    public const string Secret = "Jwt:Secret";
    public const string Issuer = "Jwt:Issuer";
    public const string Audience = "Jwt:Audience";
}

