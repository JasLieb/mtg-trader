using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Auth.Domain;
using MtgTrader.Core.Auth.Handlers;
using MtgTrader.WebApi.Services;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AuthHandler authHandler,
    JwtTokenService jwtTokenService
) : ControllerBase
{
    private readonly AuthHandler _authHandler = authHandler;
    private readonly JwtTokenService _jwtTokenService = jwtTokenService;

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

    [HttpGet]
    [Authorize]
    public ActionResult Get()
    {
        return Ok();
    }
}
