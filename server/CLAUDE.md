# Server

The solution has three layers, with dependencies pointing inward:

- `MtgTrader.Core` is the domain: entities, request/response records, handlers holding the business logic, and the interfaces for repositories and services. It has no EF Core or ASP.NET dependency, which keeps business rules testable against substituted interfaces. New logic therefore belongs in a handler, not in a controller, hub or repository.
- `MtgTrader.Infrastructure` implements Core's interfaces: EF Core on PostgreSQL, JWT tokens, the chat connection registry, and the configuration key constants.
- `MtgTrader.WebApi` turns HTTP and SignalR traffic into handler calls. Controllers and `ChatHub` stay thin. They take the acting user from the JWT claims (`ControllerExtensions.GetUserIdFromContext`, or `ClaimTypes.NameIdentifier` in the hub), never from request input, call a handler, and shape the response.

`Program.cs` is only a chain of extension methods. The wiring lives in `MtgTrader.WebApi/Extensions/`, grouped by concern, and a new handler, repository or service is registered in `ServicesExtensions.RegisterServices`. Choose its lifetime from the state it holds: repositories and stateless services are transient, handlers are scoped, and singleton is kept for process-wide state such as `ChatConnectionService`'s connection map.

Every setting has to be overridable from the environment, because Docker Compose configures the API only through environment variables. `ConfigurationExtensions.RegisterConfiguration` copies each variable (`PG_*`, `JWT_SECRET`, `CORS_ORIGINS`, `PORT`, `USE_HTTPS`) onto its `appsettings` key, and the names live in `Infrastructure/Configuration/ConfigurationConstants.cs`. A new setting follows the same path. Only `appsettings.Development.json` holds a JWT secret, so every other environment must set `JWT_SECRET` or the API refuses to start. Outside Development, Kestrel listens on `PORT`, using HTTPS with the PEM pair from `ssl/` when `USE_HTTPS` is true.
