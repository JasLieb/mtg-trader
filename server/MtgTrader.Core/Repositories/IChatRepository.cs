using System;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Repositories;

public interface IChatRepository : IBaseRepository<ChatMessage>
{
    IEnumerable<ChatMessage> FindChatMessages(string userId);
    void AddMessage(ChatMessage chatMessage);
}
