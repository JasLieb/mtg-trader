using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Auth.Domain;
using MtgTrader.Core.Auth.Handlers;

[ApiController]
[Route("[controller]")]
public class AuthController(AuthHandler authHandler) : ControllerBase
{
    private readonly AuthHandler _authHandler = authHandler;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Post(
        [FromBody] AuthRequest authRequest
    )
    {
        var authResult = _authHandler.Connect(authRequest);
        return authResult ?  Ok() : Unauthorized("Incorect auth informations");
    }
}
