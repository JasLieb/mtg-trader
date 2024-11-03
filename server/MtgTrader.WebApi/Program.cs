using MtgTrader.WebApi.Extensions;

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
app.UseAuthorization();
app.MapControllers();

app.Run();
