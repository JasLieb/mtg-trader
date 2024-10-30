namespace MtgTrader.Infrastructure.Configuration;

public static class PgConstants
{
    public const string EnvHost = "PG_HOST";
    public const string Host = "PG:Host";
    public const string Port = "PG:Port";
    public const string Db = "PG:Db";
    public const string User = "PG:User";
    public const string Password = "PG:Password";
}

public static class JwtConstants
{
    public const string EnvSecret = "JWT_SECRET";
    public const string Secret = "Jwt:Secret";
    public const string Issuer = "Jwt:Issuer";
    public const string Audience = "Jwt:Audience";
}

