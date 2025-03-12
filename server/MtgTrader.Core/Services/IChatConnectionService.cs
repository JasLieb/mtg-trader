namespace MtgTrader.Core.Services;

public interface IChatConnectionService
{
    bool AddConnection(string userId, string connectionId);
    string? FindConnection(string userId);
    bool RemoveConnection(string userId);
}
