using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MtgTrader.Core.Handlers.Chat;

namespace MtgTrader.WebApi.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub(IChatHandler chatHandler) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = (Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value)
            ?? throw new HubException("User not authenticated");
        chatHandler.AddConnection(userId, Context.ConnectionId);
        await base.OnConnectedAsync();
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
        chatHandler.AddMessage(authorId, recipientId, message);
        // var connectionId = chatHandler.FindConnection(recipientId);
        await Clients.Client(Context.ConnectionId).SendAsync("ReceiveMessage", message);
    }
}
