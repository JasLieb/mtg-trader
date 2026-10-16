# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

MtgTrader lets Magic: The Gathering players keep wantlists and a list of tradeable doubles, finds the other users they can trade with, and lets them chat. The Angular client is in `client/` and the .NET 8 API in `server/`. Each has its own CLAUDE.md, and `.claude/rules/` holds guidance that loads only when the files it concerns are being worked on.

## Commands

### Server (run from `server/`)
- Run API: `dotnet run --project MtgTrader.WebApi` (dev profile on `http://localhost:5161`, https profile on `https://localhost:7175`; Swagger is served in Development)
- New migration: `dotnet ef migrations add <Name> --project MtgTrader.Infrastructure --startup-project MtgTrader.WebApi`. The API applies pending migrations when it starts. `server/README.md` gives this as `migrations update`, which is not a valid command.

### Client (run from `client/`)
- Dev server: `npm start` (http://localhost:4200). `src/proxy.conf.json` forwards `/api/*` and the `/chathub` websocket to port 5161, so run the API's http profile alongside it.
- Tests as CI runs them: `npm test -- --watch=false --browsers=ChromeHeadless`

### Hooks (`.claude/settings.json`)
- `protect-files.js` refuses Claude's edits to the files listed under "Leave alone" below. `permissions.deny` in the same settings file blocks the same paths, so a change to that list belongs in all three places.
- `quality-gate.js` records the uncommitted files when a prompt is sent. When Claude finishes, it builds and tests each side whose files changed during the turn and lints only those files. A failure sends Claude back to fix it, at most three times, so a turn that changed code can take up to a minute longer to end.

## Domain

- A user's tradeable doubles are stored as an ordinary wantlist whose id is `{userId}_doubles`, created at registration. The rest of the app treats that list as special: it can't be deleted, it is shown apart from the wantlists, and trade matching reads it as "what I can give".
- Scryfall owns card data. The server stores only Scryfall card ids, and the client fetches names, images, prices and printings from the Scryfall API when it needs them, so no card data goes stale in the database. New card information belongs in the client's `CardService`, not in a server table or endpoint.
- A trade match runs both ways: another user's doubles that appear in my wantlists, paired with my doubles that appear in theirs (`TradeHandler.FindTrades`).

## Boundaries

Ask first:
- Adding a NuGet or npm package.
- Changing anything security-related: JWT validation, the CORS policy, or the `api/` match in the client's auth interceptor.
- Changing deployment files: the Dockerfiles (including the `.render` variants), `client/nginx/`, `docker-compose.yml` and `environment.render.ts`.
- Committing or pushing.

Leave alone:
- Existing migrations in `server/MtgTrader.Infrastructure/Migrations/`. They're generated, so a schema change gets a new migration instead.
- `database/database.sql`, a frozen copy of the first migration.
- `client/nginx/ssl/` and `server/ssl/`, which hold certificates and private keys.
- `client/package-lock.json`, which changes only through npm.

Change both sides together: request/response shapes, the chat hub's method and event names, and the `{userId}_doubles` id format each have a counterpart on the other side of the API.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage roles, each label named after its role (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
