using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Handlers.Trade;
using MtgTrader.WebApi.Extensions;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/trade")]
public class TradeController(
    ITradeHandler tradeHandler
) : ControllerBase
{
    private readonly ITradeHandler _tradeHandler = tradeHandler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Get()
    {
        var userId = ControllerExtensions.GetUserIdFromToken(this);
        if (userId == null) return Problem("Unknown user");
        return Ok(_tradeHandler.FindTrades(userId));
    }
}