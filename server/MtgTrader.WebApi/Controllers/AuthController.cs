using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Handlers.Auth;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthHandler authHandler) : ControllerBase
{
    private readonly IAuthHandler _authHandler = authHandler;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<AuthResponse> Post(
        [FromBody] AuthRequest authRequest
    )
    {
        var authResponse = _authHandler.Connect(authRequest);
        if (authResponse is null)
        {
            return Unauthorized("Incorect auth informations");
        }
        return Ok(authResponse);
    }

    // [HttpOptions]
    // public IActionResult PreflightRoute()
    // {
    //     return NoContent();
    // }
}