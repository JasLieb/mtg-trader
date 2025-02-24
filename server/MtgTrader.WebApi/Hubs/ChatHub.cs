using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MtgTrader.Core.Handlers.Chat;
using SignalRSwaggerGen.Attributes;

namespace MtgTrader.WebApi.Hubs;

[SignalRHub]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub(IChatHandler chatHandler) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = (Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value)
            ?? throw new HubException("User not authenticated");
        chatHandler.AddConnection(userId, Context.ConnectionId);
        await base.OnConnectedAsync();
        
        var history = chatHandler.LoadMessageHistory(userId);
        await Clients.Client(Context.ConnectionId).SendAsync("LoadHistory", history);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new HubException("User not authenticated");
        chatHandler.RemoveConnection(userId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string recipientId, string message)
    {
        var authorId = Context.UserIdentifier 
            ?? throw new HubException("User not authenticated");

        var chatMessage = chatHandler.AddMessage(authorId, recipientId, message);
        await Clients.Client(Context.ConnectionId).SendAsync("ReceiveMessage", chatMessage);
        
        var connectionId = chatHandler.TryFindConnection(recipientId);
        if(!string.IsNullOrEmpty(connectionId))
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
    }
}
