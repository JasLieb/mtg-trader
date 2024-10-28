using MtgTrader.WebApi.Extensions;

var builder = 
    WebApplication.CreateBuilder(args)
    .RegisterConfiguration();

builder.Services
    .RegisterSwagger()
    .RegisterInfrastructure(builder.Configuration)
    .RegisterAuthentification(builder.Configuration)
    .RegisterServices();

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
