# Client

Shared state (the user's token, wantlists, doubles and chats) lives in root-provided services, not in components. A service keeps the data in a private `BehaviorSubject` and exposes it as a read-only `name$` observable. Components read it through `toSignal` and send changes back through the service's methods, keeping only view state of their own. This gives every route the same copy of the data; a component holding its own copy would drift from it.

Backend calls build their URL with `makeApiUrl`. In development `environment.apiURl` is empty, so the route stays relative and the dev proxy handles it; other environments prefix their API host. `authInterceptor` attaches the JWT to any URL containing the substring `api/`. That is what keeps the token away from Scryfall, and it also means a third-party URL containing `api/` would receive the token.

For a request whose result is used once, `subscribeOnce` and `tapOnce` (`core/utils/subscribeExtensions.ts`) complete after the first value, so there is nothing to tear down.
