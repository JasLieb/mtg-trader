using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business;
using MtgTrader.Core.Handlers.Auth;
using MtgTrader.Infrastructure.Services.JwtToken;

[ApiController]
[Route("api/[controller]")]
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

    [HttpGet]
    [Authorize]
    public ActionResult Get()
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Ok();
    }
}
