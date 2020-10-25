using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using rest_ts_react_template.Models.Repositories;

namespace react_ts.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class IdleController : ControllerBase
  {
    private readonly IIdleRepository _repo;
    public IdleController(IIdleRepository repo) => _repo = repo;



    ///// GET: api/Idle/GetMinMaxDates
    [HttpGet("GetMinMaxDates")]
    public async Task<IActionResult> GetMinMaxDates()
    {
      try
      {
        var dates = await _repo.GetMinMaxDates();
        return Ok(dates);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    ///// GET: api/Idle/GetShops
    [HttpGet("GetShops")]
    public async Task<IActionResult> GetShops()
    {
      try
      {
        var shops = await _repo.GetShops();
        return Ok(shops);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    ///// GET: api/Idle/GetIdles?bDate=...&eDate=...&ceh=...
    [HttpGet("GetIdles")]
    public async Task<IActionResult> GetIdles(string bDate, string eDate, string ceh)
    {
      try
      {
        var idles = await _repo.GetIdles(bDate, eDate, ceh);
        return Ok(idles);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
  }
}