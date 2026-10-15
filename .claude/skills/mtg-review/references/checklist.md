# MtgTrader review checklist

Concrete review questions derived from the project's rules. Each item names its source, so read that source when you need the reasoning. Always go through "Whole repo", then the sections whose paths the change touches.

- [Whole repo](#whole-repo)
- [Server: API surface](#server-api-surface)
- [Server: handlers and domain](#server-handlers-and-domain)
- [Server: data access and schema](#server-data-access-and-schema)
- [Server: wiring and configuration](#server-wiring-and-configuration)
- [Server: tests](#server-tests)
- [Client: services and state](#client-services-and-state)
- [Client: HTTP, auth and card data](#client-http-auth-and-card-data)
- [Client: chat](#client-chat)
- [Boundaries](#boundaries)

## Whole repo

- **Contracts move together.** Did a request or response record in `server/MtgTrader.Core/Entities/Business/` gain, lose, rename or retype a field? Find its interface in `client/src/app/**/models/` and check that it matches. ASP.NET serializes in camelCase, so `WantlistsResponse.Wantlists` arrives as `wantlists`. Also check the specs that build those objects. Do the same in reverse when a client model or a request payload changes. *(CLAUDE.md, "Change both sides together"; rules/api-contracts.md)*
- **Hub names are plain strings.** `SendMessage` goes from client to server; `LoadHistory` and `ReceiveMessage` go from server to client. They match only by string between `ChatHub.cs` and `chathub.proxy.ts`. Any renamed, new or removed method or event, and any payload change, must exist on both sides with the same name and shape. *(rules/chat.md)*
- **The doubles list.** A user's doubles are the wantlist whose id is `{userId}_doubles`. Does new code that lists, deletes, renames or matches wantlists decide explicitly whether the doubles list is included? Does it identify that list by the `_doubles` suffix (`EndsWith("_doubles")`) rather than adding yet another variant (`Contains(...)`, `includes('double')`)? The doubles list must never be deletable. *(CLAUDE.md, Domain; rules/wantlists.md)*
- **Scryfall owns card data.** The server stores Scryfall card ids only. Card names, images, prices, printings or rulings must not end up in an entity, a table, a server endpoint or a server-side call to Scryfall. They belong in the client's `CardService` (`features/common/services/card/`), so nothing goes stale in the database. *(CLAUDE.md, Domain)*
- **Trade matching runs both ways.** A change to `TradeHandler.FindTrades` must keep both directions: their doubles that are in my wantlists, and my doubles that are in theirs. *(CLAUDE.md, Domain)*

## Server: API surface

Paths: `server/MtgTrader.WebApi/Controllers/`, `server/MtgTrader.WebApi/Hubs/`, `server/MtgTrader.Core/Entities/Business/`

- **Acting user from the JWT.** Controllers use `ControllerExtensions.GetUserIdFromContext(HttpContext)`; the hub uses `ClaimTypes.NameIdentifier` or `Context.UserIdentifier`. If the acting user's id is read from the body, the query string or the route, any caller can act as anyone else: blocker. *(server/CLAUDE.md)*
- **Ownership.** A mutation on something a user owns checks that it belongs to the caller. Compare `OwnerId` with the user id from the claims, never with a value the client sent.
- **Authorization.** New endpoints carry `[Authorize]`, unless they're deliberately public, like auth.
- **Thin controllers and hub.** They read the user, call a handler and shape the response. Business logic found there belongs in a handler. *(server/CLAUDE.md)*
- **Wantlist mutations return the full list.** POST, PUT, DELETE or any new mutating verb on `api/wantlist` answers with the caller's full, refreshed `WantlistsResponse`, because `WantlistService` rebuilds all wantlist and doubles state from it. Returning a single item leaves the client stale or broken. *(rules/api-contracts.md)*

## Server: handlers and domain

Paths: `server/MtgTrader.Core/`

- **No framework dependencies in Core.** `MtgTrader.Core` has no EF Core or ASP.NET dependency: no `Microsoft.EntityFrameworkCore` or `Microsoft.AspNetCore.*` usings or package references. *(server/CLAUDE.md)*
- **Logic behind interfaces.** New logic lives in a handler behind an interface in Core. Outside calls (HTTP, time, tokens) go through a Core interface implemented in Infrastructure, so handlers can be tested with substitutes.
- **Async.** No `.Result`, `.Wait()` or `GetAwaiter().GetResult()` on tasks; it blocks a request thread and invites deadlocks. No fire-and-forget calls without a stated reason.

## Server: data access and schema

Paths: `server/MtgTrader.Infrastructure/`, `server/MtgTrader.Core/Entities/General/`, `database/`

- **Query through `DbSet`.** Repositories derive from `BaseRepository<T>` and query through its `DbSet` property (`dbContext.Set<T>()`), not through `ApplicationContext`'s typed properties. The tests can only fake the former. *(rules/data-access.md)*
- **Writes aren't atomic.** Every `BaseRepository` write saves immediately, so several writes in one handler are not atomic. Is that acceptable for this operation? Watch for one write per item inside a loop. *(rules/data-access.md)*
- **Schema changes need a migration.** If an entity in `Core/Entities/General/` or `ApplicationContext.OnModelCreating` changed, there must be a new migration in `Infrastructure/Migrations/`, generated with `dotnet ef migrations add`. Existing migration files and `database/database.sql` stay untouched. *(rules/data-access.md; CLAUDE.md, "Leave alone")*
- **Query cost.** Look for N+1 queries, and for whole tables loaded to be filtered in memory.

## Server: wiring and configuration

Paths: `server/MtgTrader.WebApi/Extensions/`, `server/MtgTrader.WebApi/Program.cs`, `server/MtgTrader.Infrastructure/Configuration/`

- **Registration and lifetimes.** A new handler, repository or service is registered in `ServicesExtensions.RegisterServices` with a lifetime that matches the state it holds:
  - repositories and stateless services: transient
  - handlers: scoped
  - singleton: only for process-wide state, like `ChatConnectionService`

  A singleton that depends on a repository captures a `DbContext` across requests, and Development's scope validation will refuse to resolve it: blocker. *(server/CLAUDE.md)*
- **Program.cs stays a chain.** `Program.cs` remains a chain of extension methods, and the wiring lives in `WebApi/Extensions/`. *(server/CLAUDE.md)*
- **Settings come from the environment.** A new setting must be overridable from an environment variable. Its name goes in `Infrastructure/Configuration/ConfigurationConstants.cs`, and `ConfigurationExtensions.RegisterConfiguration` copies it onto its appsettings key. Hard-coded hosts, secrets or ports are findings, because Docker Compose configures the API only through environment variables. *(server/CLAUDE.md)*
- **New hubs need an auth path.** A new hub's path must be added to `OnMessageReceived` in `ServicesExtensions.RegisterAuthentification`; otherwise its websocket connections won't authenticate. *(rules/chat.md)*

## Server: tests

Paths: `server/MtgTrader.Tests/`

- **Coverage.** New or changed handler, repository or service behaviour has tests. *(rules/server-tests.md)*
- **Location.** Tests mirror the code: `Core/<Feature>/`, `Infrastructure/Repositories/`, `Infrastructure/Services/`.
- **Naming and assertions.** Tests are named `Should_<outcome>_when_<condition>`, and assertions use FluentAssertions.
- **Mocking libraries.** NSubstitute fakes Core interfaces and `IConfiguration`. Moq is used only for EF's `ApplicationContext` or a `DbSet`, through `AsDbSetMock`.

## Client: services and state

Paths: `client/src/app/**/services/`, `client/src/app/**/components/`

- **Shared state lives in services.** Shared state (the token, wantlists, doubles and chats) lives in a root-provided service, in a private `BehaviorSubject` exposed as a read-only `name$` observable. *(client/CLAUDE.md)*
- **Components don't copy it.** Components read shared state through `toSignal` and change it through the service's methods. A component keeping its own copy (`subscribe(x => this.something = x)`) will drift from the rest of the app. *(client/CLAUDE.md)*
- **Subscriptions end.** One-shot requests use `subscribeOnce` or `tapOnce` (`core/utils/subscribeExtensions.ts`). Any other `subscribe` in a component needs a teardown (`takeUntilDestroyed`), or should be replaced by `toSignal` or the `async` pipe. *(client/CLAUDE.md)*
- **Wantlist state comes from the server.** After a wantlist mutation, `WantlistService` rebuilds its state from the full `WantlistsResponse`. Code that patches local wantlist state by hand drifts from the server. *(rules/api-contracts.md)*

## Client: HTTP, auth and card data

Paths: `client/src/app/`

- **Backend URLs.** They're built with `makeApiUrl(...)`. Hard-coded hosts such as `http://localhost:5161` are findings. *(client/CLAUDE.md)*
- **The token goes to any `api/` URL.** `authInterceptor` attaches the user's JWT to every URL containing `api/`. A new third-party URL containing `api/` (for example `https://example.com/api/...`) would receive the user's token: blocker. Narrowing the interceptor is itself an "Ask first" change. *(client/CLAUDE.md)*
- **Card data through `CardService`.** Card names, images, prices and printings come through `CardService`, from Scryfall: not from other card APIs, not through the backend, and not fetched directly in a component. *(client/CLAUDE.md; CLAUDE.md, Domain)*
- **Shared code in `features/common/`.** Code used by more than one feature goes there. *(client/CLAUDE.md)*

## Client: chat

Paths: `client/src/app/features/trade/services/chat/`, `client/src/app/features/trade/components/chat-*/`

- **Names match `ChatHub.cs`.** Every event the proxy listens to (`hubConnection.on`) and every method it invokes (`hubConnection.invoke`) exists in `ChatHub.cs` with the same name and payload. *(rules/chat.md)*
- **Live delivery is best-effort.** `ChatConnectionService` keeps one in-memory connection per user, and the stored messages come back through `LoadHistory`. Features that depend on guaranteed live delivery need a different design. *(rules/chat.md)*

## Boundaries

From the root CLAUDE.md:

- **Needs sign-off (Ask first):**
  - a new npm or NuGet package
  - anything security-related: JWT validation, the CORS policy, the `api/` match in the auth interceptor
  - deployment files: the Dockerfiles (including the `.render` variants), `client/nginx/`, `docker-compose.yml`, `environment.render.ts`
- **Blocker (Leave alone):**
  - edits to existing migrations
  - `database/database.sql`
  - `client/nginx/ssl/` and `server/ssl/`
  - hand edits to `client/package-lock.json`
