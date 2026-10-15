using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Handlers.Wantlist;
using ControllerExtensions = MtgTrader.WebApi.Extensions.ControllerExtensions;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/wantlist")]
public class WantlistController(IWantlistHandler wantlistHandler) : ControllerBase
{
    private readonly IWantlistHandler _wantlistHandler = wantlistHandler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<WantlistsResponse> Get()
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        var wantlists = _wantlistHandler.GetWantlists(userId);
        return Ok(wantlists);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<WantlistsResponse> Post(
        [FromBody] CreateWantlistRequest request
    )
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        _ = _wantlistHandler.CreateWantlist(request, userId);
        return Get();
    }

    [HttpPut]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<WantlistsResponse> Put(
        [FromBody] UpdateWantlistRequest request
    )
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        var wantlist = _wantlistHandler.UpdateWantlist(request, userId);
        return wantlist is null
            ? NotFound("Wantlist not found")
            : Get();
    }

    [HttpDelete]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<WantlistsResponse> Delete(
        [FromQuery] string wantlistId
    )
    {
        var userId = ControllerExtensions.GetUserIdFromContext(HttpContext);
        if (userId == null) return Unauthorized();
        return _wantlistHandler.DeleteWantlist(wantlistId, userId)
            ? Get()
            : NotFound("Wantlist not found");
    }
}
