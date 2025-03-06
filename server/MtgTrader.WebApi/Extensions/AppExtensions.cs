using Microsoft.EntityFrameworkCore;
using MtgTrader.Infrastructure.Configuration;
using MtgTrader.Infrastructure.Contexts;
using MtgTrader.WebApi.Hubs;

namespace MtgTrader.WebApi.Extensions;

public static class AppExtensions
{
    public static WebApplication RegisterMiddlewares(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        else if (Convert.ToBoolean(app.Configuration[EnvConstants.EnvUseHttps]))
        {
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseCors(ServicesExtensions.CorsPolicyName);
        app.UseAuthorization();

        app.MapHub<ChatHub>("/chathub");
        app.MapControllers();
        return app;
    }

    public static WebApplication EnsureDatabaseExists(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
        db.Database.EnsureCreated();
        return app;
    }
}