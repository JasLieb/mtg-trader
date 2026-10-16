# Where a model change lands

Paths as of October 2026. If a path has moved, find it again with Grep before relying on this map, and update this file.

## Server (paths under `server/`)

| Layer | Where | Notes |
|---|---|---|
| Entity | `MtgTrader.Core/Entities/General/`: `User`, `Wantlist`, `WantlistCards`, `ChatMessage`, `TradeProposal`, `TradeProposalCard` | Primary constructors bound by EF by parameter name |
| EF configuration | `MtgTrader.Infrastructure/Contexts/ApplicationContext.cs` | `DbSet` properties and `OnModelCreating` (fluent API) |
| Migrations | `MtgTrader.Infrastructure/Migrations/` | Generated only. Protected by `protect-files.js` and `permissions.deny` |
| Repository | interface in `MtgTrader.Core/Repositories/`, implementation in `MtgTrader.Infrastructure/Repositories/` | Derives from `BaseRepository<T>` and queries through `DbSet`. Every write saves immediately |
| Handler | `MtgTrader.Core/Handlers/<Feature>/` | Maps entities to records and back |
| Records | `MtgTrader.Core/Entities/Business/Requests/` and `Responses/` | What goes over the wire, serialized in camelCase |
| Controller / hub | `MtgTrader.WebApi/Controllers/`, `MtgTrader.WebApi/Hubs/ChatHub.cs` | Thin; acting user from the JWT |
| DI | `MtgTrader.WebApi/Extensions/ServicesExtensions.cs` (`RegisterServices`) | Repositories transient, handlers scoped |
| Tests | `MtgTrader.Tests/Core/<Feature>/`, `MtgTrader.Tests/Infrastructure/Repositories/` | Many build entities and records directly |
| Seed | `database/database.sql` (repo root) | Frozen copy of `InitialMigration`. Never edit |

### Where entities are created

A new constructor parameter has to be passed at each of these sites, plus the tests (the build lists them all):

| Entity | Created in |
|---|---|
| `User` | `AuthHandler.CreateUser`, together with its `{userId}_doubles` wantlist |
| `Wantlist` | `AuthHandler.CreateUser` (the doubles list), `WantlistHandler` (user wantlists) |
| `WantlistCards` | `WantlistCardsRepository` (from a wantlist id and a card id) |
| `ChatMessage` | `ChatHandler.AddMessage` |
| `TradeProposal`, `TradeProposalCard` | `TradeProposalHandler.SendProposal` (the cards are added with their proposal) |

## Server record ↔ client model

Nothing generates the client types; each pair is maintained by hand. Paths on the client side are under `client/src/app/`.

| Server record | Client interface (wire shape) | Client consumer | Richer client type built from it |
|---|---|---|---|
| `AuthRequest` | `core/models/auth-request.ts` `AuthRequest` | `core/services/auth/auth.service.ts` | none |
| `AuthResponse` | `core/models/auth-response.ts` `AuthResponse` | `AuthService`, login/register component specs | none |
| `CreateWantlistRequest` | inline object `{ wantlistName }` in `WantlistService.create` | `features/collection/services/wantlist/wantlist.service.ts` | none |
| `UpdateWantlistRequest` | inline object `{ wantlistId, cards }` in `WantlistService.updateWantlist` | `WantlistService` | none |
| `WantlistsResponse` / `WantlistResponse` | `features/collection/models/wantlist-response.ts` `WantlistsResponse`; `features/collection/models/wantlist.ts` `WantlistMin` | `WantlistService` (GET, POST, PUT, DELETE all return it) | `Wantlist` (cards as `Card[]`) and `UserWantlists`, in `WantlistService.makeUserWantlists` |
| `TradeableResponse` / `UserTradeResponse` | `features/trade/models/tradeable-response.ts`; `features/trade/models/user-trader.ts` `UserTraderMin` | `features/trade/services/trade/trade.service.ts` | `UserTrader` (cards as `Card[]`), in `TradeService.populateUser` |
| `SendTradeProposalRequest` | `features/trade/models/trade-proposal.ts` `SendTradeProposalRequest` | `features/trade/services/trade-proposal/trade-proposal.service.ts` (`send`) | none |
| `TradeProposalsResponse` / `TradeProposalResponse` | `features/trade/models/trade-proposal.ts` `TradeProposalsResponse`, `TradeProposalMin` | `TradeProposalService` (GET and POST both return it) | `TradeProposal` (cards as `Card[]`), in `TradeProposalService.populateProposals` |
| `ChatsResponse` / `ChatResponse` / `ChatMessageResponse` | `features/trade/models/chat.ts` `Chats`, `ChatDto`; `features/trade/models/chat-message.ts` `ChatMessage` | `features/trade/services/chat/chathub.proxy.ts` (`LoadHistory`, `ReceiveMessage`) | `Chat` (recipient as `UserTrader`) |

A field missing from the "richer" type's mapping is dropped silently: the mapping code builds a new object field by field. For example, `makeUserWantlists` copies only `id`, `name` and `cards`.

### Serialization details

- ASP.NET uses camelCase: `CreatedAt` arrives as `createdAt`.
- `string?` and other nullable types arrive as `null` when empty, so the TypeScript type is `T | null`.
- `DateTime` arrives as an ISO 8601 string. The existing `ChatMessage.date` is typed `Date` but holds a string at runtime, so convert it before calling `Date` methods.
- Npgsql maps `DateTime` to `timestamp with time zone`, and writing a `DateTime` whose `Kind` isn't `Utc` throws. In handlers, read the time from `IDateTimeService.Now`, which already returns UTC, as `ChatHandler` does.
- Hub payloads are matched by string name and shape between `ChatHub.cs` and `chathub.proxy.ts`; see `.claude/rules/chat.md`.

## Specs that build these objects

Grep for the interface or record name, and for an object literal with its fields:

- Server: `Grep "new (WantlistResponse|UserTradeResponse|…)\("` under `server/MtgTrader.Tests/`.
- Client: `Grep "WantlistMin|UserTraderMin|ChatDto|…"` in `client/src/**/*.spec.ts`. Many specs build plain object literals typed only by context, so also grep for a distinctive existing field (such as `doubles:` or `chatMessages:`) to find them.
