using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
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
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Get()
    {
        var userId = ControllerExtensions.GetUserIdFromToken(this);
        if (userId == null) return Problem("Unknown user");
        var wantlists = _wantlistHandler.GetWantlists(userId);
        return Ok(wantlists);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Post(
        [FromBody] CreateWantlistRequest request
    )
    {
        var userId = ControllerExtensions.GetUserIdFromToken(this);
        if (userId == null) return Problem("Unknown user");
        _ = _wantlistHandler.CreateWantlist(request, userId);
        return Get();
    }


    [HttpPut]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Put(
        [FromBody] UpdateWantlistRequest request
    )
    {
        var wantlist = _wantlistHandler.UpdateWantlist(request);
        return wantlist is null 
            ? Problem("Wantlist doesnt exists")
            : Get();
    }
    
    [HttpDelete]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Delete(
        [FromQuery] string wantlistId
    )
    {
        _wantlistHandler.DeleteWantlist(wantlistId);
        return Get();
    }
}
