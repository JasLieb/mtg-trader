using System;
using Microsoft.AspNetCore.SignalR;
using MtgTrader.Core.Handlers.Chat;
using MtgTrader.WebApi.Extensions;

namespace MtgTrader.WebApi.Hubs;

public class ChatHub(IChatHandler chatHandler) : Hub
{
    public async Task SendMessage(string senderId, string recipientId, string message)
    {
        var authorId = Context.UserIdentifier ?? senderId;
        chatHandler.AddMessage(authorId, recipientId, message);
        await Clients.User(recipientId).SendAsync("ReceiveMessage", message);
    }
}
