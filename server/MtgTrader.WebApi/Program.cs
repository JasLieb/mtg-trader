using MtgTrader.Infrastructure.Configuration;
using MtgTrader.WebApi.Extensions;
using MtgTrader.WebApi.Hubs;

var builder =
    WebApplication.CreateBuilder(args)
    .RegisterConfiguration()
    .RegisterWebAppListening();

builder.Services
    .RegisterInfrastructure(builder.Configuration)
    .RegisterSwagger()
    .RegisterAuthentification(builder.Configuration)
    .RegisterServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else if (Convert.ToBoolean(app.Configuration[EnvConstants.EnvUseHttps]))
{
    app.UseHsts();
}

// app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(ServicesExtensions.CorsPolicyName);
app.UseAuthorization();

app.MapHub<ChatHub>("/chathub");
app.MapControllers();


app.Run();
