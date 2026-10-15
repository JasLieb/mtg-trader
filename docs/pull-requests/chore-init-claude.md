# fix: hash passwords, lock down wantlists, CORS and chat; add Claude Code tooling

## Summary
This branch bundles two things. It sets up Claude Code for the repo (CLAUDE.md files, rules, hooks, and the `mtg-review` and `mtg-schema-change` skills), and it ships the fixes from the first `mtg-review` passes on the server and the client: hashed passwords, normalized emails with unique usernames, owner-only wantlist edits, a CORS allow-list instead of any origin, a required JWT secret, chat and trade-matching fixes, and ESLint for the client. The server half changes how accounts are stored and what the API needs to start, so read Deployment before merging.

## Changes
**Server: accounts and security**
- Passwords are hashed with PBKDF2-SHA256 when an account is created. Accounts created before this change still hold a plain-text password; it is checked once and replaced by a hash at their next login (`Pbkdf2PasswordHasher`, `AuthHandler`).
- Emails are trimmed and lower-cased at registration and login, and the lookup ignores case. `Users.Username` gets a unique index, and registering an email that is already used answers 409, including when two registrations race (`AuthHandler`, `UserRepository.CreateWithDoubles`, migration `UniqueUsername`). The user and their `{userId}_doubles` list are now saved in one `SaveChanges`.
- Only its owner can update or delete a wantlist. Before, any logged-in user could change or delete any wantlist by id. Another user's wantlist, an unknown id or (on DELETE) the doubles list now answer 404 (`WantlistHandler`, `WantlistController`).
- The JWT secret has to come from `JWT_SECRET`; only `appsettings.Development.json` keeps a dev secret. The signing key is read as UTF-8 instead of ASCII (`ConfigurationExtensions`, `JwtTokenService`). Unused `TokenValidityInDays` and `RefreshTokenValidityInDays` settings are removed.
- CORS accepts only the origins in `CORS_ORIGINS`, or `Cors:Origins` in `appsettings.json` when that's unset. The allow-any-origin fallback is removed (`ServicesExtensions`).
- Errors use real status codes instead of 500: 401 when the token carries no user, 409 for an email already in use, 404 for a wantlist that isn't found.

**Server: chat and trades**
- Chat history and live messages are sent as `ChatMessageResponse` records and no longer embed the author's and recipient's user records, which included their password (`ChatHandler`, `ChatRepository`, `ChatsResponse`).
- The recipient of a message now gets the message object on `ReceiveMessage`, as the sender already did. Before, they got the bare text, which the client can't attach to a conversation, so live messages only appeared after a reload (not verified in a browser) (`ChatHub`).
- `SendMessage` rejects empty messages, messages over 1,000 characters and unknown recipients with a `HubException` (`ChatHandler.MaxMessageLength`).
- When a user closes a second tab, live delivery to their first tab no longer stops, and the connection map is safe for concurrent use (`ChatConnectionService`).
- Trade matching reads what a trader wants from their wantlists only, no longer from their own doubles list, and runs as a few batched queries instead of several per trader (`TradeHandler`, `WantlistRepository.FindTradeableDoubles`, `GetUsersWantlists`, `UserRepository.GetByUserIds`).

**Client: lint, error handling and accessibility**
- ESLint through `angular-eslint` (`npm run lint`, new `lint` target in `angular.json`), with fixes for its findings: Scryfall responses typed in `CardService`, `any` replaced by `unknown`, unused imports removed, and component outputs renamed without the `on` prefix (`cardFound`, `cardDeleted`, `cardUpdated`).
- `WantlistService` drops a failed request instead of passing an `Error` on as if it were a response.
- Chat conversation tabs can be focused and opened with Enter or Space; the logo has an empty `alt`.

**Tooling and docs**
- Claude Code setup: `CLAUDE.md` for the repo, client and server; `.claude/rules/`; `.claude/settings.json` with the `protect-files.js` and `quality-gate.js` hooks; the `mtg-review` and `mtg-schema-change` skills.

## API contract
| Endpoint / hub member | Change | Client side |
|---|---|---|
| `ReceiveMessage` | Recipient gets the message object instead of the bare text; payload is `ChatMessageResponse` (no `author` / `recipient` user objects) | ✅ `chathub.proxy.ts` already reads a `ChatMessage` with these fields |
| `LoadHistory` | `ChatsResponse` items are `ChatResponse` / `ChatMessageResponse`; same camelCase fields, minus the embedded users | ✅ `Chats`, `ChatDto`, `ChatMessage` never read the users |
| `SendMessage` | Throws `HubException` for empty, over-1,000-character or unknown-recipient messages | ⚠️ `chathub.proxy.ts` only logs the error to the console |
| `POST api/user` | 409 for an email already in use (was 500) | ✅ `AuthService` handles every error the same way |
| `GET api/user` | 401 for an invalid token (was 500) | ✅ `AuthService` |
| `PUT` / `DELETE api/wantlist` | 404 for an unknown or someone else's wantlist, and for DELETE on the doubles list (was 500, or 200 for those DELETEs) | ✅ `WantlistService.handleError` |
| `GET` / `POST api/wantlist`, `GET api/trade` | 401 when the token carries no user (was 500) | ✅ |
| `UpdateWantlistRequest` | File renamed from `AddCardRequest.cs`; content unchanged | ✅ no change |

Every change works with the client currently in production, and the new client works with the current API.

## Database
- Migration `20261015141853_UniqueUsername`: `CREATE UNIQUE INDEX "IX_Users_Username" ON "Users" ("Username")`. Existing rows: unchanged. The migration fails if two rows share exactly the same username.

## Deployment

**Risk:** high: the API now refuses to start unless `JWT_SECRET` is set on the Render `api` service.

**Before merging**
- [ ] Confirm `JWT_SECRET` is set on the Render `api` service (Environment), to a long random string. It is not in `render.yaml`, the placeholder secret is gone from `appsettings.json`, and `RegisterConfiguration` now throws without one, so a missing variable means the API doesn't start and the deploy fails. If it wasn't set, production was signing tokens with the placeholder committed in the repo; setting it ends every current session (tokens last one hour).
- [ ] Confirm the client's Render URL is `https://client-tek5.onrender.com` (Render dashboard, `client` service) (not verified). The API now accepts only the origins in `Cors:Origins` unless `CORS_ORIGINS` is set on the `api` service. If the URL differs, set `CORS_ORIGINS` to a comma-separated list that includes it, or the browser will block every API call and the chat connection.
- [ ] Run these against the Render database (external connection string from the dashboard). Each should return no rows:
  ```sql
  -- Exact duplicates: the unique index can't be created, the migration fails and the API doesn't start.
  SELECT "Username", COUNT(*) FROM "Users" GROUP BY "Username" HAVING COUNT(*) > 1;
  -- Duplicates once case is ignored: login now ignores case and would pick one of these accounts arbitrarily.
  SELECT LOWER("Username"), COUNT(*) FROM "Users" GROUP BY LOWER("Username") HAVING COUNT(*) > 1;
  -- Leading or trailing spaces: login now trims what the user types but not the stored value, so these accounts can't log in.
  SELECT "Id", "Username" FROM "Users" WHERE "Username" <> TRIM("Username");
  ```
  Rows from the first query block the deploy. Rows from the other two are accounts that will misbehave at login; fix them before or with the deploy.

**During the deploy**
- Migration `UniqueUsername` runs when the API starts and adds the unique index. Existing rows are unchanged.
- Existing accounts keep their plain-text password until their next login, which replaces it with a hash. Accounts that never log in again stay in plain text.
- New accounts are stored with a trimmed, lower-case email. Existing mixed-case emails still log in, since the lookup ignores case.
- The signing key's bytes are the same for an ASCII `JWT_SECRET`, so existing tokens stay valid. If the secret has non-ASCII characters, everyone has to log in again.
- The two services deploy in either order with no broken window: the old client works against the new API, and the new client against the old API (see API contract).
- Local stack only: `docker compose up` now stops unless `JWT_SECRET` is exported in the shell.

**After the deploy**
- [ ] `GET https://api-p4y7.onrender.com/api` returns the welcome message
- [ ] The client loads from its Render URL and the browser console shows no CORS errors
- [ ] Log in with an account created before the deploy, log out, then log in again typing the email in a different case
- [ ] Register a new account; registering the same email again is refused (409); reload while logged in
- [ ] Create a wantlist, search a card and add it, change a card's printing, delete the wantlist; add a card to Doubles
- [ ] With two accounts whose doubles and wantlists overlap, Trade lists the match on both sides
- [ ] Open a chat from a trade and send a message: the other account receives it live, and the history is there after a reload
- [ ] Card names, images and prices load from Scryfall; navigation, logo and logout work

**Rollback**
- Revert the merge on `main` (autoDeploy redeploys), or roll a service back from the Render dashboard.
- The unique index stays after a code rollback. The previous code works with it; it only rejects exact duplicate usernames.
- Can't be undone: the previous code compares passwords in plain text, so after an API rollback, every account that registered or logged in since the deploy (now hashed) can't log in. Prefer fixing forward on the API. Rolling back the client alone is safe.

## Testing
- Tests added or changed:
  - Server: `Pbkdf2PasswordHasherTests` (new); `AuthHandlerTests` (hashing, legacy plain-text login, normalized email, registration race); `ChatHandlerTests` (rejected messages, history without users); `TradeHandlerTests` (a trader's own doubles don't count as wanted); `WantlistHandlerTests` (owner checks); `UserRepositoryTests`, `WantlistRepositoryTests`, `ChatRepositoryTests`; `ChatConnectionService` (a second connection closing).
  - Client: 10 specs updated for the renamed outputs and lint fixes.
- Checks run: client render build ✅ (`npx ng build --configuration=render`, initial bundle 1.01 MB, no budget warning); migration SQL generated ✅ (the server built as part of it). Server and client test suites not run while writing this.
- [ ] CI green on GitHub (CI Back Validation, CI Client Validation)
- [ ] Manually tested: the After the deploy flows above, against a database with accounts created before this branch

## Reviewer notes
- **Needs sign-off:**
  - JWT: the secret is now required, with no default in `appsettings.json`; key bytes ASCII to UTF-8.
  - CORS: the allow-any-origin fallback (`SetIsOriginAllowed(_ => true)`) is removed; origins come from `CORS_ORIGINS` or `Cors:Origins`.
  - Password hashing (`Pbkdf2PasswordHasher`, 600,000 iterations), with a plain-text fallback for existing rows.
  - New npm dev packages: `angular-eslint` 19.8.1, `eslint` ^9.28.0, `typescript-eslint` 8.33.1. The lockfile adds 143 packages and bumps 5 transitive build tools; no runtime package changes. Render's `npm install` installs them, and the render build passed with them.
  - Deployment files: `docker-compose.yml` (requires `JWT_SECRET`), `client/angular.json` (new `lint` target, otherwise reformatting).
  - The auth interceptor change is `var` to `const` only; its `api/` match is unchanged.
- **Look closely at:**
  - `UserRepository.GetByUsername` lower-cases both sides, so Postgres can't use `IX_Users_Username` for it (a scan of `Users` on every login and registration). The index is case-sensitive, so it doesn't stop case variants of existing mixed-case emails either.
  - Every login and registration runs PBKDF2 with 600,000 iterations, which may add noticeable latency on Render's free plan (not verified).
  - A message rejected by `SendMessage` is only logged to the console by `chathub.proxy.ts`, and the chat input has no length limit, so the sender gets no feedback (not verified in a browser).
