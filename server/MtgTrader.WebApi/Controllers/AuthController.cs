using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Handlers.Auth;
using MtgTrader.Infrastructure.Services.JwtToken;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthHandler authHandler,
    IJwtTokenService jwtTokenService
) : ControllerBase
{
    private readonly IAuthHandler _authHandler = authHandler;
    private readonly IJwtTokenService _jwtTokenService = jwtTokenService;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult Post(
        [FromBody] AuthRequest authRequest
    )
    {
        var user = _authHandler.Connect(authRequest);
        if (user is null)
        {
            return Unauthorized("Incorect auth informations");
        }
        var token = _jwtTokenService.CreateToken(user);
        return Ok(new { usrToken = token });
    }
}