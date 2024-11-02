using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Handlers.Auth;
using MtgTrader.Infrastructure.Services.JwtToken;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api/user")]
public class UserController(
    IAuthHandler authHandler,
    IJwtTokenService jwtTokenService
) : ControllerBase
{
    private readonly IAuthHandler _authHandler = authHandler;
    private readonly IJwtTokenService _jwtTokenService = jwtTokenService;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Post(
        [FromBody] AuthRequest authRequest
    )
    {
        var user = _authHandler.CreateUser(authRequest);
        if (user is null)
        {
            return Problem("Unable to create user");
        }
        var token = _jwtTokenService.CreateToken(user);
        return Ok(new { usrToken = token });
    }
}