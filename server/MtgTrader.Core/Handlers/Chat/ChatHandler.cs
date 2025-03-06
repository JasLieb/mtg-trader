using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Chat;

public class ChatHandler(
    IChatRepository chatRepository
) : IChatHandler
{
    private static readonly Dictionary<string, string> _connections = [];

    private readonly IChatRepository _chatRepository = chatRepository;
    public bool AddConnection(string userId, string connectionId) =>
        _connections.TryAdd(userId, connectionId);

    public string? TryFindConnection(string userId) =>
        _connections.GetValueOrDefault(userId);

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
        _connections.Remove(userId);

    private IDictionary<string, Entities.General.Chat> GroupByUniqueRecipient(
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
