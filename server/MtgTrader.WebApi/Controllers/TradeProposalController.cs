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

    [HttpGet("partners/{partnerId}/doubles")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<PartnerDoublesResponse> GetPartnerDoubles(string partnerId)
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        var doubles = _tradeProposalHandler.GetPartnerDoubles(userId, partnerId);
        // Not a Trade partner: the list is answered as missing rather than forbidden, so nothing is revealed about it.
        return doubles is null
            ? NotFound("Doubles list not found")
            : Ok(doubles);
    }

    [HttpPost("{proposalId}/accept")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(MissingCardsResponse), StatusCodes.Status422UnprocessableEntity)]
    public ActionResult<TradeProposalsResponse> Accept(string proposalId) =>
        Act(userId => _tradeProposalHandler.AcceptProposal(userId, proposalId));

    [HttpPost("{proposalId}/decline")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<TradeProposalsResponse> Decline(string proposalId) =>
        Act(userId => _tradeProposalHandler.DeclineProposal(userId, proposalId));

    [HttpPost("{proposalId}/withdraw")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<TradeProposalsResponse> Withdraw(string proposalId) =>
        Act(userId => _tradeProposalHandler.WithdrawProposal(userId, proposalId));

    // Like the POST, a successful action answers with all of the user's proposals.
    private ActionResult<TradeProposalsResponse> Act(Func<string, TradeProposalActionResult> action)
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        var result = action(userId);
        return result.Outcome switch
        {
            TradeProposalActionOutcome.Done => Get(),
            TradeProposalActionOutcome.NotFound => NotFound("Trade proposal not found"),
            TradeProposalActionOutcome.NotAllowed => Forbid(),
            TradeProposalActionOutcome.MissingCards => UnprocessableEntity(new MissingCardsResponse(result.MissingCards)),
            _ => Conflict("This trade proposal is no longer pending"),
        };
    }
}
