using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace react_ts.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase
  {
    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
      _logger = logger;
    }

    [HttpGet]
    public IActionResult Get(string login, string password)
    {
      if (login == "a" && password == "aaaaaa")
        return Ok(new { user = new User { Id = 2, Login = login, Password = password }, UserRole = "admin" });

      return BadRequest(new { error = "No such user" });
    }
  }
}
