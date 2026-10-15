using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Core.Services;

namespace MtgTrader.Core.Handlers.Chat;

public class ChatHandler(
    IChatRepository chatRepository,
    IUserRepository userRepository,
    IChatConnectionService chatConnection,
    IDateTimeService dateTimeService
) : IChatHandler
{
    public const int MaxMessageLength = 1000;

    private readonly IChatRepository _chatRepository = chatRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IChatConnectionService _chatConnection = chatConnection;
    private readonly IDateTimeService _dateTimeService = dateTimeService;

    public bool AddConnection(string userId, string connectionId) =>
        _chatConnection.AddConnection(userId, connectionId);

    public string? FindConnection(string userId) =>
        _chatConnection.FindConnection(userId);

    public ChatMessageResponse? AddMessage(
        string senderId,
        string recipientId,
        string message
    )
    {
        if (string.IsNullOrWhiteSpace(message)
            || message.Length > MaxMessageLength
            || _userRepository.GetByUserId(recipientId) is null)
            return null;

        var chatMessage = _chatRepository.AddMessage(
            new ChatMessage(
                Guid.NewGuid().ToString(),
                message,
                senderId,
                recipientId,
                _dateTimeService.Now
            )
        );
        return ToResponse(chatMessage);
    }

    public ChatsResponse LoadMessageHistory(string userId)
    {
        var chatMessages = _chatRepository.FindChatMessages(userId).ToList();
        var chatsDict = GroupByUniqueRecipient(userId, chatMessages);

        return new(chatsDict.Values);
    }

    public bool RemoveConnection(string userId, string connectionId) =>
        _chatConnection.RemoveConnection(userId, connectionId);

    private static ChatMessageResponse ToResponse(ChatMessage message) =>
        new(message.Id, message.Message, message.AuthorId, message.RecipientId, message.Date);

    private static Dictionary<string, ChatResponse> GroupByUniqueRecipient(
        string userId,
        List<ChatMessage> chatMessages
    )
    {
        Dictionary<string, ChatResponse> chatsMap = [];
        chatMessages.ForEach(
            message =>
            {
                var otherUserId = message.RecipientId == userId ? message.AuthorId : message.RecipientId;
                if (!chatsMap.TryGetValue(otherUserId, out var associatedChat))
                {
                    associatedChat = new(otherUserId, []);
                }
                associatedChat = associatedChat with { ChatMessages = associatedChat.ChatMessages.Append(ToResponse(message)) };
                chatsMap[otherUserId] = associatedChat;
            }
        );
        return chatsMap;
    }
}
