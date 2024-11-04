using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace MtgTrader.WebApi.Extensions;

public static class ControllerExtensions
{
    public static string? GetUserIdFromToken(this ControllerBase controller)
    {
        return controller.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}
