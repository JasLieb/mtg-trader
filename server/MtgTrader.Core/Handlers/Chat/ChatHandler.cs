using System;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Chat;

public class ChatHandler : IChatHandler
{
    private static readonly Dictionary<string, string> _connections = [];

    private readonly IChatRepository _chatRepository = chatRepository;

    public void AddConnection(string userId, string connectionId)
    {
        _connections.TryAdd(userId, connectionId);
    }

    public void AddMessage(string senderId, string recipientId, string message)
    {
        
    }

    public void RemoveConnection(string userId)
    {
        _connections.Remove(userId);
    }
}
