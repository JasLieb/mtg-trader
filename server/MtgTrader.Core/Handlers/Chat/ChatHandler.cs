using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Core.Services;

namespace MtgTrader.Core.Handlers.Chat;

public class ChatHandler(
    IChatRepository chatRepository, 
    IChatConnectionService chatConnection
) : IChatHandler
{
    private readonly IChatRepository _chatRepository = chatRepository;
    private readonly IChatConnectionService _chatConnection = chatConnection;

    public bool AddConnection(string userId, string connectionId) =>
        _chatConnection.AddConnection(userId, connectionId);

    public string? FindConnection(string userId) =>
        _chatConnection.FindConnection(userId);

    public ChatMessage AddMessage(
        string senderId,
        string recipientId,
        string message
    )
    {
        return _chatRepository.AddMessage(
            new ChatMessage(
                Guid.NewGuid().ToString(),
                message,
                senderId,
                recipientId
            )
        );
    }

    public ChatsResponse LoadMessageHistory(string userId)
    {
        var chatMessages = _chatRepository.FindChatMessages(userId).ToList();
        var chatsDict = GroupByUniqueRecipient(userId, chatMessages);

        return new(chatsDict.Values);
    }

    public bool RemoveConnection(string userId) =>
        _chatConnection.RemoveConnection(userId);

    private static Dictionary<string, Entities.General.Chat> GroupByUniqueRecipient(
        string userId,
        List<ChatMessage> chatMessages
    )
    {
        Dictionary<string, Entities.General.Chat> chatsMap = [];
        chatMessages.ForEach(
            message =>
            {
                var otherUserId = message.RecipientId == userId ? message.AuthorId : message.RecipientId;
                if (!chatsMap.TryGetValue(otherUserId, out var associatedChat))
                {
                    associatedChat = new(otherUserId, []);
                }
                associatedChat = associatedChat with { ChatMessages = associatedChat.ChatMessages.Append(message) };
                chatsMap[otherUserId] = associatedChat;
            }
        );
        return chatsMap;
    }
}
