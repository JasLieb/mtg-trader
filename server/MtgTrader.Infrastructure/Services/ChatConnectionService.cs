using System.Collections.Concurrent;
using MtgTrader.Core.Services;

namespace MtgTrader.Infrastructure.Services;

public class ChatConnectionService : IChatConnectionService
{
    // Singleton shared by every hub connection, so it must be safe for concurrent use.
    private readonly ConcurrentDictionary<string, string> _connections = new();

    public bool AddConnection(string userId, string connectionId) =>
        _connections.TryAdd(userId, connectionId);

    public string? FindConnection(string userId) =>
        _connections.GetValueOrDefault(userId);

    public bool RemoveConnection(string userId, string connectionId) =>
        _connections.TryRemove(KeyValuePair.Create(userId, connectionId));
}
