# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

MtgTrader: Magic: The Gathering wantlists, tradeable doubles, trade matching between users, and chat. Angular client in `client/`, .NET 8 API in `server/` — each has its own CLAUDE.md with architecture notes.

## Commands

### Server (run from `server/`)
- Run API: `dotnet run --project MtgTrader.WebApi` (dev profile listens on `http://localhost:5161`, https profile on `https://localhost:7175`; Swagger is enabled in Development)
- Single test / class: `dotnet test --filter "FullyQualifiedName~WantlistHandlerTests.Should_return_..."`
- New migration: `dotnet ef migrations add <Name> --project MtgTrader.Infrastructure --startup-project MtgTrader.WebApi` (pending migrations are applied automatically at startup via `EnsureDatabaseExists`; note `server/README.md` wrongly says `migrations update`)

### Client (run from `client/`)
- Dev server: `npm start` (http://localhost:4200; `src/proxy.conf.json` proxies `/api/*` and `/chathub` (websocket) to `http://localhost:5161`)
- Tests (as CI runs them): `npm test -- --watch=false --browsers=ChromeHeadless`
- Single spec file: `npm test -- --include src/app/features/trade/services/trade/trade.service.spec.ts`

## Domain conventions
- **Doubles are a wantlist.** On registration, `AuthHandler.CreateUser` creates a wantlist with id `{userId}_doubles`. Code distinguishes doubles from regular wantlists by the `_doubles` id suffix (`WantlistHandler` refuses to delete it; `TradeHandler` uses it to compute trades).
- Cards are identified by **Scryfall card ids**; the server stores only ids (`WantlistCards.CardId`), never card data. The client fetches card data directly from the Scryfall API.
- Trade matching (`TradeHandler.FindTrades`): other users' doubles that are in my wantlists ↔ my doubles that are in their wantlists, grouped per user.
