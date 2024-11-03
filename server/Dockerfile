FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

COPY *.sln .
COPY MtgTrader.WebApi/*.csproj ./MtgTrader.WebApi/
COPY MtgTrader.Infrastructure/*.csproj ./MtgTrader.Infrastructure/
COPY MtgTrader.Core/*.csproj ./MtgTrader.Core/
COPY MtgTrader.Tests/*.csproj ./MtgTrader.Tests/
COPY ssl/. ./ssl/
RUN dotnet restore

COPY MtgTrader.WebApi/. ./MtgTrader.WebApi/
COPY MtgTrader.Infrastructure/. ./MtgTrader.Infrastructure/
COPY MtgTrader.Core/. ./MtgTrader.Core/
WORKDIR /source/MtgTrader.WebApi
RUN dotnet publish -c release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./
COPY --from=build /source/ssl/. /app/ssl/
ENTRYPOINT ["dotnet", "MtgTrader.WebApi.dll"]

EXPOSE 7175