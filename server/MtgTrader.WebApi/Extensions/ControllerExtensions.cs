using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace MtgTrader.WebApi.Extensions;

public static class ControllerExtensions
{
    public static string? GetUserIdFromContext(HttpContext context)
    {
        return context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
