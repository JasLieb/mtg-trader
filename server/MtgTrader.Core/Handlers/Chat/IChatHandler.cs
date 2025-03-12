using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Handlers.Chat;

public interface IChatHandler
{
    bool AddConnection(string userId, string connectionId);
    string? FindConnection(string userId);
    ChatMessage AddMessage(string senderId, string recipientId, string message);

    ChatsResponse LoadMessageHistory(string userId);
    bool RemoveConnection(string userId);
}
