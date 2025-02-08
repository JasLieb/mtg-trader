using System;

namespace MtgTrader.Core.Handlers.Chat;

public interface IChatHandler
{
    void AddMessage(string senderId, string recipientId, string message);
}
