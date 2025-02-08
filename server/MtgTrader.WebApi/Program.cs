using MtgTrader.WebApi.Extensions;
using MtgTrader.WebApi.Hubs;

var builder =
    WebApplication.CreateBuilder(args)
    .RegisterConfiguration()
    .RegisterHttpsRedirection();

builder.Services
    .RegisterSwagger()
    .RegisterInfrastructure(builder.Configuration)
    .RegisterAuthentification(builder.Configuration)
    .RegisterServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors(ServicesExtensions.CorsPolicyName);
app.UseAuthorization();

app.MapHub<ChatHub>("/chathub");
app.MapControllers();

app.Run();
