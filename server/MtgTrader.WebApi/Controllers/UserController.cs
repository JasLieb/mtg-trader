using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Handlers.Auth;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/user")]
public class UserController(IAuthHandler authHandler) : ControllerBase
{
    private readonly IAuthHandler _authHandler = authHandler;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<AuthResponse> Get()
    {
        var accessToken = Request.Headers[HeaderNames.Authorization];

        var authResponse = _authHandler.CheckTokenValidity(accessToken.ToString());
        return authResponse is null
            ? Unauthorized("Invalid token")
            : Ok(authResponse);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public ActionResult<AuthResponse> Post(
        [FromBody] AuthRequest authRequest
    )
    {
        var authResponse = _authHandler.CreateUser(authRequest);
        if (authResponse is null)
        {
            return Conflict("This email is already used");
        }
        return Ok(authResponse);
    }

    // [HttpOptions]
    // public IActionResult PreflightRoute()
    // {
    //     return NoContent();
    // }
}