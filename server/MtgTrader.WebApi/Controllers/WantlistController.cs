using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business;
using MtgTrader.Core.Handlers.Wantlist;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/wantlist")]
public class WantlistController(IWantlistHandler wantlistHandler) : ControllerBase
{
    private readonly IWantlistHandler _wantlistHandler = wantlistHandler;

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
        var wantlist = _wantlistHandler.CreateWantlist(request with { OwnerId = claim.Value});
        return Ok(wantlist);
    }
    
    [HttpPut]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Put(
        [FromBody] AddCardRequest request
    )
    {
        var wantlist = _wantlistHandler.AddCard(request);
        return Ok(wantlist);
    }
}
