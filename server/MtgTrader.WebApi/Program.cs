using MtgTrader.WebApi.Extensions;

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

app.RegisterMiddlewares()
    .EnsureDatabaseExists();

app.Run();
