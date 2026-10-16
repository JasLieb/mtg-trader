# Cross-cutting review checklist

Read this for every review: these rules span the server and the client, or the whole repo. Each item names its source.

## Contracts and domain

- **Contracts move together.** Did a request or response record in `server/MtgTrader.Core/Entities/Business/` gain, lose, rename or retype a field? Find its interface in `client/src/app/**/models/` and check that it matches. ASP.NET serializes in camelCase, so `WantlistsResponse.Wantlists` arrives as `wantlists`. Also check the specs that build those objects. Do the same in reverse when a client model or a request payload changes. *(CLAUDE.md, "Change both sides together"; rules/api-contracts.md)*
- **Hub names are plain strings.** `SendMessage` goes from client to server; `LoadHistory` and `ReceiveMessage` go from server to client. They match only by string between `ChatHub.cs` and `chathub.proxy.ts`. Any renamed, new or removed method or event, and any payload change, must exist on both sides with the same name and shape. *(rules/chat.md)*
- **The doubles list.** A user's doubles are the wantlist whose id is `{userId}_doubles`. Does new code that lists, deletes, renames or matches wantlists decide explicitly whether the doubles list is included? Does it identify that list by the `_doubles` suffix (`EndsWith("_doubles")`) rather than adding yet another variant (`Contains(...)`, `includes('double')`)? The doubles list must never be deletable. *(CLAUDE.md, Domain; rules/wantlists.md)*
- **Scryfall owns card data.** The server stores Scryfall card ids only. Card names, images, prices, printings or rulings must not end up in an entity, a table, a server endpoint or a server-side call to Scryfall. They belong in the client's `CardService` (`features/common/services/card/`), so nothing goes stale in the database. *(CLAUDE.md, Domain)*
- **Trade matching runs both ways.** A change to `TradeHandler.FindTrades` must keep both directions: their doubles that are in my wantlists, and my doubles that are in theirs. *(CLAUDE.md, Domain)*

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
