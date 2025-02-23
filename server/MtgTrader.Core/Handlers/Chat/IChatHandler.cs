using System;

namespace MtgTrader.Core.Handlers.Chat;

public interface IChatHandler
{
    void AddConnection(string userId, string connectionId);
    void AddMessage(string senderId, string recipientId, string message);
    void RemoveConnection(string userId);
}
