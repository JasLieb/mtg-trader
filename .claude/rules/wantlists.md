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

The existing checks differ. On the server, `WantlistHandler`, `TradeHandler` and `WantlistRepository.FindTradeableDoubles` use the suffix (`EndsWith("_doubles")`), while the client's `WantlistService` uses `includes('double')`. They agree today only because every other wantlist id is a GUID. New code should test for the `_doubles` suffix rather than add another variant.
