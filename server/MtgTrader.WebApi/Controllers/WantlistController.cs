using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Handlers.Wantlist;

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
        var claim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) return Problem("Unknown user");
        var wantlists = _wantlistHandler.GetWantlists(claim.Value);
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
        var claim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) return Problem("Unknown user");
        _ = _wantlistHandler.CreateWantlist(request, claim.Value);
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
        _ = _wantlistHandler.UpdateWantlist(request);
        return Get();
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
