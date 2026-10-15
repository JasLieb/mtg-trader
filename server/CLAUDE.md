# Server architecture

Clean-architecture style, dependencies point inward:

- **MtgTrader.Core** — entities (`Entities/General` = EF-persisted models, `Entities/Business` = request/response DTOs), **handlers** (business logic per feature: Auth, Wantlist, Trade, Chat), and *interfaces* for repositories and services. No EF/ASP.NET dependencies here.
- **MtgTrader.Infrastructure** — `ApplicationContext` (EF Core/Npgsql), repository implementations (all derive from `BaseRepository<T>`, which uses `_dbContext.Set<T>()` and calls `SaveChanges()` on every write), service implementations (`JwtTokenService`, `ChatConnectionService`, `DateTimeService`), migrations, and `Configuration/ConfigurationConstants.cs` (config keys + env var names).
- **MtgTrader.WebApi** — thin controllers that pull the user id from the JWT (`ControllerExtensions.GetUserIdFromContext`) and delegate to handlers; `Hubs/ChatHub.cs` (SignalR, mapped at `/chathub`); all DI/startup wiring lives in `Extensions/` (`ServicesExtensions.RegisterServices` is where new handlers/repositories/services must be registered).
- **MtgTrader.Tests** — mirrors `Core/` and `Infrastructure/`. Handlers are tested with mocked repository interfaces; repositories are tested against a `Mock<ApplicationContext>` whose `Set<T>()` returns an in-memory `DbSet` built via `.AsDbSetMock()` (`Extensions/MoqExtensions.cs`). Repositories must therefore access data through `Set<T>()` (not `DbSet` properties) to stay testable.

Configuration: `ConfigurationExtensions.RegisterConfiguration` lets environment variables (`PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, JWT secret, `PORT`, `USE_HTTPS`) override `appsettings*.json`. Outside Development, Kestrel listens on `PORT` with HTTPS (PEM cert from `ssl/`) or plain HTTP depending on `USE_HTTPS`.

SignalR auth: the JWT is passed as the `access_token` query string for `/chatHub` requests (see `OnMessageReceived` in `RegisterAuthentification`).
