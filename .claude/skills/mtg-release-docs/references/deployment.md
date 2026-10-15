# Deploying MtgTrader: what each signal means

Facts as of October 2026. If `render.yaml`, a Dockerfile or `AppExtensions.cs` changed in the range you're documenting, re-read them; the change itself may make a line here wrong.

## Contents

1. How the app is deployed
2. Signals: what to check, what to write
3. Risk level
4. Smoke tests by feature
5. Rollback

## 1. How the app is deployed

**Render (production).** `render.yaml` declares two Docker web services and one database, all on the free plan:

| Service | Built from | Runs | Configured by |
|---|---|---|---|
| `api` | `server/Dockerfile.render` (`dotnet publish`, .NET 8) | Kestrel over HTTP on `PORT=10000`; Render terminates TLS | `PG_*` from `mtgtrader-db` and `PORT`, in `render.yaml`. **`JWT_SECRET` and `CORS_ORIGINS` are not in `render.yaml`**, so if they're set, they're set in the Render dashboard |
| `client` | `client/Dockerfile.render`: `npm install`, then `npm run build -- --configuration=render`, served by nginx (`nginx.render.conf`, SPA fallback, no proxy) | static files on port 80 | `environment.render.ts`, baked in at build time. `apiURl` is `https://api-p4y7.onrender.com`, so the browser calls the API and the `/chathub` websocket cross-origin |
| `mtgtrader-db` | Render Postgres | | |

- Both services have `autoDeploy: true` and `render.yaml` sets no build filter, so **every push to `main` rebuilds and redeploys both services**, whatever it touches. They deploy independently, with no ordering between them.
- **Migrations run when the API starts.** `AppExtensions.EnsureDatabaseExists` calls `Database.Migrate()` when migrations are pending, in every environment. Nobody reads the SQL at deploy time. If a migration fails, the API doesn't start and the deploy fails.
- **The API refuses to start without `JWT_SECRET`** (`ConfigurationExtensions.RegisterConfiguration`): only `appsettings.Development.json` has a secret.
- **CORS.** The allowed origins come from `CORS_ORIGINS` or, if that's unset, from `Cors:Origins` in `appsettings.json`. The client's Render host must be in the effective list, or the browser blocks every API call. That host is presumably `client-tek5.onrender.com`, but the only place the repo names it is that same CORS list, so the check is circular. It's unconfirmed: when CORS matters to a change, add a "Before" checkbox to confirm the client URL in the Render dashboard, and mark it "(not verified)".
- **Free plan.** After a period of inactivity the first request to a service can take a while as it wakes up. Don't mistake that for a failed deploy.

**docker-compose (full local stack).** `client` is nginx over HTTPS on 443, with certificates from `client/nginx/ssl/` and a production build (`npm run build --prod`). `api` is HTTPS on 7175 (`USE_HTTPS=TRUE`, PEM pair from `server/ssl/`). `JWT_SECRET` is taken from the shell. `db` is `postgres:16.4` seeded from `database/database.sql`, a frozen copy of `InitialMigration`; the API applies every later migration on top of it.

**CI (GitHub Actions, on every push).** `ci-back-validation.yml`: restore, build, test (.NET 8). `ci-front-validation.yml`: `npm install`, Karma tests. CI does **not** run the client's production or render build, the linters, or a migration check. The `gh` CLI isn't installed here, so CI results can't be read from this machine; the author has to check them on GitHub.

## 2. Signals: what to check, what to write

Each signal from `changes.js` ends up as a step or a note in the Deployment section, or as an explicit dismissal ("`appsettings.Development.json`: dev only"). The script finds files. Whether they matter is your call, and that takes reading the diff.

### New migration

Check:
- Read `Up` and `Down`, and get the SQL with the command the script prints (it needs the working tree at the range's end; otherwise read the files with `git show`).
- What existing rows get, using this table:

| In `Up` | Effect on a database that has data | Write |
|---|---|---|
| `CreateTable`, nullable `AddColumn`, `AddColumn` with a meaningful default | None on existing rows | "During": one line |
| Non-nullable `AddColumn` with a placeholder default (`""`, `0`, `0001-01-01`) | Every existing row gets the placeholder | "During": say what existing rows will show. Medium risk |
| Unique `CreateIndex` on an existing table | Fails if duplicates exist; then the API doesn't start | "Before": a duplicate-check query built from the migration's real table and column names, e.g. `SELECT "Username", COUNT(*) FROM "Users" GROUP BY "Username" HAVING COUNT(*) > 1;`, run against the Render database. High risk |
| `DropColumn`, `DropTable`, `DropColumn` + `AddColumn` on one table | Data is lost | "Before": a backup (`pg_dump` with the external connection string from the Render dashboard). High risk |
| `AlterColumn` that narrows (shorter length, nullable → not null, type change) | Fails or truncates | "Before": a query for rows that wouldn't fit. High risk |

Also check whether old code still works on the new schema, because rolling back the code doesn't roll back the schema (see 5).

### Model changed without a new migration

The deploy won't change the schema the code now expects. Treat it as a blocker: put it in Reviewer notes and suggest the `mtg-schema-change` skill. Don't write deploy steps for a schema that won't exist.

### Data whose meaning changes without a schema change

No migration shows this. The script's "Stored data possibly read differently" section lists candidate lines (normalization, hashing, encodings, time kinds, the doubles id). That list is neither complete nor proof: read every server diff that reads stored data, whether or not it's listed. Examples: a password hashing change, normalizing (lowercasing, trimming) a value before comparing it with stored values, a new format for ids (such as `{userId}_doubles`), dates now treated as UTC. Ask what happens to rows written **before** the deploy. Can existing users still log in? Is a stored `John@x.com` still found once the lookup lowercases? If old rows are handled (for example, re-hashed at next login), write one line saying how. If they aren't, it's a high-risk item: it needs a data fix before or with the deploy, which goes under "Before".

### Environment variables and settings

- **New variable.** It has to be set wherever the `appsettings.json` default isn't right. On Render, use the dashboard for secrets; `render.yaml` holds non-secret values, but editing it is Ask first. Also set it in `docker-compose.yml` and, for local dev, `appsettings.Development.json`. Say which in "Before".
- **Newly required setting**: a `throw` when it's missing, or a default removed from `appsettings.json`. The script reports both, along with where each variable is set. Every environment that relied on the default now has to set it, or the API won't start. Put a "Before" checkbox: "Confirm `X` is set on the Render `api` service".
- **Removed variable.** Note the cleanup.
- **Never write a secret value into a doc**, even one visible in the diff. Name the variable and describe the value ("a long random string").

### Configuration files

| File | Reaches | Write |
|---|---|---|
| `appsettings.json` | Every environment, unless an env var overrides the key | What changes where, especially `Cors:Origins` and defaults that Render relies on |
| `appsettings.Development.json`, `launchSettings.json`, `client/src/proxy.conf.json`, `environment.development.ts` | Local dev only | Dismiss: "dev only" |
| `environment.ts` | The production build (docker-compose client) | Usually nothing for Render |
| `environment.render.ts` | The Render client; the API host is baked in at build | Ask first. The API host must exist and allow the client's origin |
| `ConfigurationConstants.cs`, `ConfigurationExtensions.cs` | How settings are read | See "Environment variables" |

### Security (Ask first)

- **JWT** (secret, issuer, audience, signing, validation, how the key bytes are derived): work out whether a token issued before the deploy still validates after it. If not, every user is logged out and must log in again. Say so under "During".
- **CORS**: work out the effective origin list on Render after the deploy (the `CORS_ORIGINS` override, else `appsettings.json`), and check the client's Render host is in it. Removing a permissive fallback (such as `SetIsOriginAllowed(_ => true)`) makes the list matter for the first time.
- **Password hashing**: see "Data whose meaning changes".
- **Auth interceptor `api/` match**: decides which URLs receive the token. Note any widening.

All of these go under "Needs sign-off" in a PR's Reviewer notes.

### API contract

Services deploy independently, and browsers keep the old client bundle until the page reloads. So for every contract change, work out what the old client does against the new API, and the reverse:

- **Additive** (a new optional field, a new endpoint, a new hub method the old client doesn't call): safe in any order. One line.
- **Breaking** (a removed, renamed or retyped field; a removed or renamed endpoint, hub method or event; a changed payload shape; changed status codes the client handles): write the window. For example: "Until users reload, the old client receives `ReceiveMessage` with an object where it expects a string". Say how long it lasts and what users see. High risk if users would see errors or lose data.
- **One-sided** (the server changed and the client didn't, or a hub name or payload changed on one side only): check whether the client already matches. If it doesn't, it's a blocker for the Reviewer notes; also describe its effect after the deploy.

### Deployment files (Ask first)

- **Dockerfiles**: say what changes in the image. Render builds `Dockerfile.render`; docker-compose builds `Dockerfile`.
- **`render.yaml`**: changes only apply if the services are managed as a Render Blueprint. Ask the user, or tell them to check the dashboard after the merge.
- **`client/angular.json`**: budgets and configurations affect the Render build, so run it (see SKILL.md).
- **`client/nginx/*.conf`**: routing and caching of the client.
- **`.github/workflows/`**: CI only; no deploy effect.

### Dependencies

- A new package is Ask first, so it goes under "Needs sign-off".
- For a major upgrade (Angular, the .NET target framework, EF Core, Npgsql, SignalR), say what it could break and whether the build images still fit. The server images pin `sdk:8.0`/`aspnet:8.0`, while the client images use unpinned `node:alpine` and `nginx:latest`.
- `(dev)` packages don't reach the browser, but Render's `npm install` installs them, so they can still break the build.

### "Leave alone" files

An edited existing migration, `database/database.sql`, the `ssl/` folders: a blocker for the Reviewer notes. An edited migration never runs again on a database that already applied it, so production would silently diverge.

### Nothing that runs changed

Tooling, docs or tests only: write "No deployment steps: <why>. Merging still redeploys both Render services, with no functional change."

## 3. Risk level

- **High**: data loss, or a migration that can fail on existing data; a newly required setting; a JWT, CORS or password change that affects existing users; existing data read differently; a breaking contract change; a Dockerfile or `render.yaml` change.
- **Medium**: an additive migration, a new optional setting, an additive contract change, a dependency upgrade, a client build configuration change.
- **Low**: everything else.

Give the level and the single reason that sets it.

## 4. Smoke tests by feature

Pick the flows for the features the script lists under "Features touched". After every deploy, also check that `GET https://api-p4y7.onrender.com/api` returns the welcome message (the API started and its migrations ran) and that the client loads.

| Feature | Flow to check after the deploy |
|---|---|
| server Auth, server User, client authentication, client core (auth) | Register a new account; log out; log in with an account that existed **before** the deploy; reload while logged in (the token check) |
| server Wantlist, client collection | Create a wantlist, search a card and add it, change a card's printing, delete the wantlist; add a card to Doubles |
| server Trade, client trade (trade-card-list) | With two accounts whose doubles and wantlists overlap, Trade lists the match on both sides |
| server Chat, client trade (chat-home) | Open a chat from a trade, send a message, the other account receives it live; history is there after a reload |
| client common (card) | Card names, images and prices load from Scryfall |
| client app shell, client core (navigation-bar) | Navigation, logo, logout |

Prefer accounts and data that existed before the deploy. That's where migrations and data-meaning changes show up.

## 5. Rollback

- **Code**: revert the commit(s) on `main`, and autoDeploy redeploys the previous code. Render's dashboard can also roll a service back to an earlier deploy.
- **Schema**: rolling back the code leaves the migration applied. Say whether the previous code works on the new schema:

| Migration | Previous code on the new schema |
|---|---|
| New table, new nullable or defaulted column, new non-unique index | Works |
| New NOT NULL column without a database default | Inserts into that table fail |
| New unique index | Works, but now rejects duplicates |
| Dropped, renamed or retyped column or table | Fails on every query that touches it |

  If the schema has to go back too: `node .claude/skills/mtg-schema-change/scripts/ef.js database update <PreviousMigration>` with `PG_*` set to the Render database's external connection. It runs `Down`, which can drop data. It's a deliberate production action for the user to take, never a default step.
- **Data**: a data fix (re-hashing passwords, normalizing values) usually can't be undone. Say so.
