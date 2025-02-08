using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class ChatRepository(ApplicationContext dbContext)
    : BaseRepository<ChatMessage>(dbContext), IChatRepository
{
    public IEnumerable<ChatMessage> FindChatMessages(string userId) =>
        DbSet.Where(chat => chat.AuthorId == userId);

    public void AddMessage(ChatMessage chatMessage)
    {
        DbSet.Add(chatMessage);
    }
}
