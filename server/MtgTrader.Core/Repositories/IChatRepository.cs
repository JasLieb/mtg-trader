using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IChatRepository : IBaseRepository<ChatMessage>
{
    IEnumerable<ChatMessage> FindChatMessages(string userId);
    ChatMessage AddMessage(ChatMessage chatMessage);
}
