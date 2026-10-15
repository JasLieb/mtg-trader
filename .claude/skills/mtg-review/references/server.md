# Server review checklist

Paths: `server/`. Each item names its source. Items marked *(code)* describe how the code behaves today rather than a written rule, so re-check them if that code has changed.

- [Tracing a server change](#tracing-a-server-change)
- [API surface](#api-surface)
- [Handlers and domain](#handlers-and-domain)
- [Data access and schema](#data-access-and-schema)
- [Wiring and configuration](#wiring-and-configuration)
- [Auth](#auth)
- [Tests](#tests)
- [Known issues already in the code](#known-issues-already-in-the-code)

## Tracing a server change

For every changed endpoint or hub method, follow the request end to end. Most server bugs here sit between two layers, not inside one:

1. Controller or hub (`WebApi/Controllers/`, `WebApi/Hubs/`)
2. Handler interface and implementation (`Core/Handlers/<Feature>/`)
3. Repository interface (`Core/Repositories/`) and implementation (`Infrastructure/Repositories/`)
4. The entity (`Core/Entities/General/`), plus the migration if it changed
5. Registration in `ServicesExtensions.RegisterServices`
6. Tests (`MtgTrader.Tests/`)

## API surface

Paths: `WebApi/Controllers/`, `WebApi/Hubs/`, `Core/Entities/Business/`

- **Acting user from the JWT.** Controllers use `ControllerExtensions.GetUserIdFromContext(HttpContext)`; the hub uses `ClaimTypes.NameIdentifier` or `Context.UserIdentifier`. If the acting user's id is read from the body, the query string or the route, any caller can act as anyone else: blocker. *(server/CLAUDE.md)*
- **Ownership.** A mutation on something a user owns checks that it belongs to the caller. Compare `OwnerId` with the user id from the claims, never with a value the client sent.
- **Authorization.** New endpoints carry `[Authorize]`, unless they're deliberately public, like auth.
- **Thin controllers and hub.** They read the user, call a handler and shape the response. Business logic found there belongs in a handler. *(server/CLAUDE.md)*
- **Wantlist mutations return the full list.** POST, PUT, DELETE or any new mutating verb on `api/wantlist` answers with the caller's full, refreshed `WantlistsResponse`, because the client's `WantlistService` rebuilds all wantlist and doubles state from it. *(rules/api-contracts.md)*
- **Return business records, not entities.** Endpoints and hub events send records from `Core/Entities/Business`. An entity from `Core/Entities/General` leaks fields (`User` carries `Password`) and drags its navigation properties into the JSON. *(code)*
- **Status codes.** `Problem(...)` answers 500 and is for server faults only. The controllers answer a missing user claim with `Unauthorized()`, an unknown or someone else's wantlist with `NotFound()`, and an email that's already registered with `Conflict()`. New endpoints follow suit, using `BadRequest()` for invalid input, so the client can tell these cases apart from a server fault. *(code)*
- **Hub methods are public API.** Any connected client can invoke any public method on `ChatHub`, with any arguments. Validate them in the handler, as `ChatHandler.AddMessage` does (the recipient exists, the message isn't empty or longer than `MaxMessageLength`). Never treat an id argument as the caller's identity. *(rules/chat.md; code)*
- **Request records.** With nullable reference types on and `[ApiController]`, the non-nullable properties of a `[FromBody]` record are required: the client gets a 400 if they're missing. Is a field the client may omit declared non-nullable? Is a required field declared nullable, so the handler must cope with null?

## Handlers and domain

Paths: `Core/`

- **No framework dependencies in Core.** `MtgTrader.Core` has no EF Core or ASP.NET dependency: no `Microsoft.EntityFrameworkCore` or `Microsoft.AspNetCore.*` usings or package references. *(server/CLAUDE.md)*
- **Logic behind interfaces.** New logic lives in a handler behind an interface in Core. Outside calls (HTTP, tokens, the clock) go through a Core interface implemented in Infrastructure, so handlers can be tested with substitutes. *(server/CLAUDE.md)*
- **The clock.** Handlers read the time through `IDateTimeService`, as `ChatHandler` does, not through `DateTime.Now` or `UtcNow`, so tests can pin it. *(code)*
- **Null means "not found or not allowed".** Several handlers and repositories return `null` for that (`UpdateWantlist`, `Connect`, `CreateUser`, `AddMessage`, `CreateWithDoubles`). Check that every caller of a changed or new handler method handles the null instead of dereferencing it. *(code)*
- **Async.** No `.Result`, `.Wait()` or `GetAwaiter().GetResult()` on tasks; it blocks a request thread and invites deadlocks. No fire-and-forget calls without a stated reason.

## Data access and schema

Paths: `Infrastructure/`, `Core/Entities/General/`, `database/`

- **Query through `DbSet`.** Repositories derive from `BaseRepository<T>` and query through its `DbSet` property (`dbContext.Set<T>()`), not through `ApplicationContext`'s typed properties. The tests can only fake the former. *(rules/data-access.md)*
- **Navigation properties are only there when the query includes them.** `BaseRepository.GetById` uses `Find`, which loads no related data, so `wantlist.Cards` is an empty list after it. `GetUserWantlists`, `GetUsersWantlists` and `FindTradeableDoubles` load the cards with `.Include(...)`. Before trusting a navigation property, check how the repository method loaded the entity. *(code)*
- **Writes aren't atomic.** Every `BaseRepository` write saves immediately, so several writes in one handler are not atomic. Is that acceptable for this operation? When it isn't, add a repository method that saves everything at once, as `UserRepository.CreateWithDoubles` does. Watch for one write per item inside a loop. *(rules/data-access.md)*
- **Schema changes need a migration.** If an entity in `Core/Entities/General/` or `ApplicationContext.OnModelCreating` changed, there must be a new migration in `Infrastructure/Migrations/`, generated with `dotnet ef migrations add`. Existing migration files and `database/database.sql` stay untouched. *(rules/data-access.md; CLAUDE.md, "Leave alone")*
- **Read the new migration.** The API applies pending migrations when it starts (`AppExtensions.EnsureDatabaseExists`), so a migration runs on the next deploy without anyone looking at it. Check three things:
  - its `Up` matches the entity change;
  - `ApplicationContextModelSnapshot.cs` was regenerated alongside it;
  - nothing destructive slips in without a plan for existing data: a `DropColumn` or `DropTable`, a narrowing `AlterColumn`, or a new non-nullable column without a default on a table that already has rows. *(code)*
- **Query cost.** Look for N+1 queries, and for whole tables loaded to be filtered in memory.

## Wiring and configuration

Paths: `WebApi/Extensions/`, `WebApi/Program.cs`, `Infrastructure/Configuration/`

- **Registration and lifetimes.** A new handler, repository or service is registered in `ServicesExtensions.RegisterServices` with a lifetime that matches the state it holds:
  - repositories and stateless services: transient
  - handlers: scoped
  - singleton: only for process-wide state, like `ChatConnectionService`

  A singleton that depends on a repository captures a `DbContext` across requests, and Development's scope validation will refuse to resolve it: blocker. *(server/CLAUDE.md)*
- **Program.cs stays a chain.** `Program.cs` remains a chain of extension methods, and the wiring lives in `WebApi/Extensions/`. *(server/CLAUDE.md)*
- **Settings come from the environment.** A new setting must be overridable from an environment variable. Its name goes in `Infrastructure/Configuration/ConfigurationConstants.cs`, and `ConfigurationExtensions.RegisterConfiguration` copies it onto its appsettings key. Hard-coded hosts, secrets or ports are findings, because Docker Compose configures the API only through environment variables. *(server/CLAUDE.md)*
- **A new hub needs two registrations.** It must be mapped in `AppExtensions.RegisterMiddlewares` (`app.MapHub<...>`), and its path must be accepted by `OnMessageReceived` in `ServicesExtensions.RegisterAuthentification`. Otherwise its websocket connections won't authenticate. *(rules/chat.md)*
- **Security wiring is "Ask first".** Changes to JWT validation (`RegisterAuthentification`, `JwtTokenService`) or to the CORS policy (`RegisterInfrastructure`) go under "Needs sign-off". *(CLAUDE.md, Boundaries)*

## Auth

Paths: `Core/Handlers/Auth/`, `WebApi/Controllers/AuthController.cs`, `WebApi/Controllers/UserController.cs`, `Infrastructure/Services/JwtTokenService.cs`

- **Passwords go through `IPasswordHasher`.** `Pbkdf2PasswordHasher` hashes at registration, and `Verify` checks at login. New code never stores or compares a plain-text password. *(code)*
- **Registration keeps the doubles list.** `AuthHandler.CreateUser` saves the user and their `{userId}_doubles` wantlist together through `IUserRepository.CreateWithDoubles`. A new way of creating users must do the same, or that user can never trade. *(CLAUDE.md, Domain)*
- **Emails are normalized.** `AuthHandler` trims and lower-cases the email before every lookup or insert, `GetByUsername` compares case-insensitively, and `Users.Username` has a unique index. *(code)*
- **The JWT secret comes from the environment.** Only `appsettings.Development.json` holds one; any other environment must set `JWT_SECRET`, and `RegisterConfiguration` refuses to start without it. A secret added to `appsettings.json` is a blocker. *(server/CLAUDE.md)*
- **Token contents.** `JwtTokenService.CreateToken` puts only the user id (`NameIdentifier`) in the token, with a one-hour expiry. Code that reads another claim will get null unless the token is changed too, and that change is "Ask first". *(code)*

## Tests

Paths: `MtgTrader.Tests/`

- **Coverage.** New or changed handler, repository or service behaviour has tests, including the null and doubles-list paths. *(rules/server-tests.md)*
- **Location.** Tests mirror the code: `Core/<Feature>/`, `Infrastructure/Repositories/`, `Infrastructure/Services/`.
- **Naming and assertions.** Tests are named `Should_<outcome>_when_<condition>`, and assertions use FluentAssertions.
- **Mocking libraries.** NSubstitute fakes Core interfaces and `IConfiguration`. Moq is used only for EF's `ApplicationContext` or a `DbSet`, through `AsDbSetMock`.
- **Constructor changes break tests.** A record or entity whose constructor changed breaks every test that builds it. The build catches the compile error, but check that the updated tests still assert something meaningful about the new field.

## Known issues already in the code

When a change touches the code around one of these, report it under "Already there", after confirming it's still present. Don't count it against the change. When a known problem is deliberately left in place, add it here.

- Accounts that haven't logged in since password hashing was introduced still hold a plain-text password. `AuthHandler.Connect` hashes it at their next login.
