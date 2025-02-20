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
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult Get()
    {
        var accessToken = Request.Headers[HeaderNames.Authorization];

        var isValidToken = _authHandler.CheckTokenValidity(accessToken.ToString());
        return isValidToken ? Ok() : Problem("Invalid token");
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public ActionResult<AuthResponse> Post(
        [FromBody] AuthRequest authRequest
    )
    {
        var authResponse = _authHandler.CreateUser(authRequest);
        if (authResponse is null)
        {
            return Problem("Unable to create user");
        }
        return Ok(authResponse);
    }
}