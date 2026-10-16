using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Handlers.TradeProposals;
using MtgTrader.WebApi.Extensions;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/trade-proposals")]
public class TradeProposalController(
    ITradeProposalHandler tradeProposalHandler
) : ControllerBase
{
    private readonly ITradeProposalHandler _tradeProposalHandler = tradeProposalHandler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<TradeProposalsResponse> Get()
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        return Ok(_tradeProposalHandler.GetProposals(userId));
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<TradeProposalsResponse> Post(
        [FromBody] SendTradeProposalRequest request
    )
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        return _tradeProposalHandler.SendProposal(userId, request)
            ? Get()
            : BadRequest("Invalid trade proposal");
    }
}
