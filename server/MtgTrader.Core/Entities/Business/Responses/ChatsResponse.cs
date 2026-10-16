namespace MtgTrader.Core.Entities.Business.Responses;

public record ChatsResponse(
    IEnumerable<ChatResponse> Chats
);

public record ChatResponse(
    string RecipientId,
    IEnumerable<ChatMessageResponse> ChatMessages
);

public record ChatMessageResponse(
    string Id,
    string Message,
    string AuthorId,
    string RecipientId,
    DateTime Date
);
