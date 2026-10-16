---
paths:
  - "server/MtgTrader.Core/Handlers/Auth/**/*.cs"
  - "server/MtgTrader.Core/Handlers/Wantlist/**/*.cs"
  - "server/MtgTrader.Core/Handlers/Trade/**/*.cs"
  - "server/MtgTrader.Infrastructure/Repositories/Wantlist*.cs"
  - "client/src/app/features/collection/**/*.ts"
  - "client/src/app/features/trade/services/trade/**/*.ts"
---

# Wantlists and doubles

The `_doubles` id suffix is the only thing that marks a user's doubles list. Any code that lists, deletes or matches wantlists therefore has to decide whether the doubles list is included.

Each side defines that format once: `DoublesList` in `MtgTrader.Core/Entities/General` on the server (`IdFor`, `IsDoublesListId`, `IsDoublesList`, `IdSuffix`), and `features/collection/models/doubles-list.ts` on the client (`doublesListIdFor`, `isDoublesListId`, `splitDoublesList`). New code goes through them instead of spelling out `_doubles`. The one exception is an EF Core query, which can't translate a method call: it tests `EndsWith(DoublesList.IdSuffix)` itself, as `WantlistRepository.FindTradeableDoubles` does.
