using Microsoft.AspNetCore.Mvc;

namespace MtgTrader.WebApi.Controllers;

[ApiController]
[Route("api")]
public class HomeController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Welcome()
    {
        return Ok(new { welcome_msg = "Welcome on Mtg Trader API !" });
    }
}
