# Client architecture

- `src/app/core/` holds app-wide pieces. `authInterceptor` adds the `Bearer` token from localStorage key `usr-token` to any request whose URL contains `api/`. `makeApiUrl` prefixes routes with `environment.apiURl`, which is empty in development so the dev proxy is used.
- `src/app/features/<feature>/{components,services,models}` — `common` holds the shared `card` component and `CardService`.

Card data is fetched **directly from the Scryfall public API** by `CardService` (search, fetch by id, and all printings/sets of a card), not through the backend. Chat uses `features/trade/services/chat/chathub.proxy.ts` (SignalR) against the server's `ChatHub` (`LoadHistory`, `ReceiveMessage`, `SendMessage`).
