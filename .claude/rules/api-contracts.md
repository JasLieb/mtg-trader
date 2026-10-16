---
paths:
  - "server/MtgTrader.Core/Entities/Business/**/*.cs"
  - "server/MtgTrader.WebApi/Controllers/**/*.cs"
  - "client/src/app/**/models/**/*.ts"
  - "client/src/app/**/services/**/*.ts"
---

# API contracts

Nothing generates the client's types from the server. Each request/response record in `MtgTrader.Core/Entities/Business` has a hand-written TypeScript interface in a feature's `models/` folder, and ASP.NET serializes the record in camelCase (`WantlistsResponse.Wantlists` arrives as `wantlists`). A change to either side is complete only when the other side, and any spec that builds those objects, matches it.

Wantlist mutations (POST, PUT and DELETE on `api/wantlist`) answer with the caller's full, refreshed `WantlistsResponse` rather than the one item that changed, because `WantlistService` rebuilds its whole wantlist and doubles state from every response. A mutation that returned anything else would leave the client's state stale.
