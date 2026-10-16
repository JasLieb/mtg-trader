---
paths:
  - "server/MtgTrader.WebApi/Hubs/**/*.cs"
  - "server/MtgTrader.Core/Handlers/Chat/**/*.cs"
  - "server/MtgTrader.Infrastructure/Services/ChatConnectionService.cs"
  - "client/src/app/features/trade/services/chat/**/*.ts"
  - "client/src/app/features/trade/components/chat-*/**/*.ts"
---

# Chat (SignalR)

`ChatHub` and `chathub.proxy.ts` agree only through strings. The client invokes `SendMessage(recipientId, message)`, and the server pushes `LoadHistory` on connect and `ReceiveMessage` for each new message, whose payload the client reads as a `ChatMessage`. A rename or payload change has to land on both sides together.

Browsers can't set headers on a websocket, so the client sends its JWT as the `access_token` query parameter. `OnMessageReceived` in `ServicesExtensions.RegisterAuthentification` accepts it only on paths starting with `/chatHub`, so a new hub needs its path added there or its connections won't authenticate.

`ChatConnectionService` is an in-memory singleton mapping each user id to a single connection id. It keeps the first connection a user opens and forgets it only when that same connection closes. It is emptied on restart and isn't shared between instances. Live delivery is therefore best-effort. The messages stored through `ChatRepository` are the source of truth, and the client receives them again through `LoadHistory` each time it connects.
