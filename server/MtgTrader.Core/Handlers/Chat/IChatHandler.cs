using MtgTrader.Core.Entities.Business.Responses;

namespace MtgTrader.Core.Handlers.Chat;

public interface IChatHandler
{
    bool AddConnection(string userId, string connectionId);
    string? FindConnection(string userId);
    ChatMessageResponse? AddMessage(string senderId, string recipientId, string message);

    ChatsResponse LoadMessageHistory(string userId);
    bool RemoveConnection(string userId, string connectionId);
}
