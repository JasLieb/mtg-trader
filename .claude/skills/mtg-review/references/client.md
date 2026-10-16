# Client review checklist

Paths: `client/`. Each item names its source.

## Services and state

Paths: `client/src/app/**/services/`, `client/src/app/**/components/`

- **Shared state lives in services.** Shared state (the token, wantlists, doubles and chats) lives in a root-provided service, in a private `BehaviorSubject` exposed as a read-only `name$` observable. *(client/CLAUDE.md)*
- **Components don't copy it.** Components read shared state through `toSignal` and change it through the service's methods. A component keeping its own copy (`subscribe(x => this.something = x)`) will drift from the rest of the app. *(client/CLAUDE.md)*
- **Subscriptions end.** One-shot requests use `subscribeOnce` or `tapOnce` (`core/utils/subscribeExtensions.ts`). Any other `subscribe` in a component needs a teardown (`takeUntilDestroyed`), or should be replaced by `toSignal` or the `async` pipe. *(client/CLAUDE.md)*
- **Wantlist state comes from the server.** After a wantlist mutation, `WantlistService` rebuilds its state from the full `WantlistsResponse`. Code that patches local wantlist state by hand drifts from the server. *(rules/api-contracts.md)*

## HTTP, auth and card data

Paths: `client/src/app/`

- **Backend URLs.** They're built with `makeApiUrl(...)`. Hard-coded hosts such as `http://localhost:5161` are findings. *(client/CLAUDE.md)*
- **The token goes to any `api/` URL.** `authInterceptor` attaches the user's JWT to every URL containing `api/`. A new third-party URL containing `api/` (for example `https://example.com/api/...`) would receive the user's token: blocker. Narrowing the interceptor is itself an "Ask first" change. *(client/CLAUDE.md)*
- **Card data through `CardService`.** Card names, images, prices and printings come through `CardService`, from Scryfall: not from other card APIs, not through the backend, and not fetched directly in a component. *(client/CLAUDE.md; CLAUDE.md, Domain)*
- **Shared code in `features/common/`.** Code used by more than one feature goes there. *(client/CLAUDE.md)*

## Chat

Paths: `client/src/app/features/trade/services/chat/`, `client/src/app/features/trade/components/chat-*/`

- **Names match `ChatHub.cs`.** Every event the proxy listens to (`hubConnection.on`) and every method it invokes (`hubConnection.invoke`) exists in `ChatHub.cs` with the same name and payload. *(rules/chat.md)*
- **Live delivery is best-effort.** `ChatConnectionService` keeps one in-memory connection per user, and the stored messages come back through `LoadHistory`. Features that depend on guaranteed live delivery need a different design. *(rules/chat.md)*
