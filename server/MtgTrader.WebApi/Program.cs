using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MtgTrader.Core.Auth.Domain;
using MtgTrader.Core.Auth.Handlers;
using MtgTrader.WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration["JWT:Secret"] = Environment.GetEnvironmentVariable("JWT_SECRET") ?? builder.Configuration["JWT:Secret"];
builder.Configuration["PG:Host"] = Environment.GetEnvironmentVariable("PG_HOST") ?? builder.Configuration["PG:Host"];

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
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


builder.Services.AddDbContextPool<AuthContext>(
    opt =>
        opt.UseNpgsql(GetConnectionString())
);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])),
            ClockSkew = TimeSpan.Zero
        };
    });


builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddScoped<AuthHandler>();
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.UseHttpsRedirection();
app.UseAuthorization();

app.Run();

string GetConnectionString() 
{
    var str = $"Server={builder.Configuration["PG:Host"]};Port={builder.Configuration["PG:Port"]};Database={builder.Configuration["PG:Db"]};UserName={builder.Configuration["PG:User"]};Password={builder.Configuration["PG:Password"]}";
    return str;
}