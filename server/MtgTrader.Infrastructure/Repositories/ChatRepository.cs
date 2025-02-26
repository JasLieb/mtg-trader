using Microsoft.EntityFrameworkCore;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;
using MtgTrader.Infrastructure.Contexts;

namespace MtgTrader.Infrastructure.Repositories;

public class ChatRepository(ApplicationContext dbContext)
    : BaseRepository<ChatMessage>(dbContext), IChatRepository
{
    public IEnumerable<ChatMessage> FindChatMessages(string userId) =>
        [
            .. DbSet.Where(chat => chat.AuthorId == userId || chat.RecipientId == userId)
                .Include(x => x.Author)
                .Include(x => x.Recipient)
        ];

    public ChatMessage AddMessage(ChatMessage chatMessage)
    {
        return Create(chatMessage);
    }
}
