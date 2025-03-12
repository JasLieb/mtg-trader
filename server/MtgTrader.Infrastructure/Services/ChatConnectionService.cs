using MtgTrader.Core.Services;

namespace MtgTrader.Infrastructure.Services;

public class ChatConnectionService : IChatConnectionService
{
    private readonly Dictionary<string, string> _connections = [];

    public bool AddConnection(string userId, string connectionId) =>
        _connections.TryAdd(userId, connectionId);

    public string? FindConnection(string userId) =>
        _connections.GetValueOrDefault(userId);

    public bool RemoveConnection(string userId) =>
        _connections.Remove(userId);
}
