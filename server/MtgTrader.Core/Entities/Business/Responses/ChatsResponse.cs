using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Entities.Business.Responses;

public record ChatsResponse(
    IEnumerable<Chat> Chats
);