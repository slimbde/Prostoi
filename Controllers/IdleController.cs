using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories.Interfaces;


namespace Prostoi.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class IdleController : ControllerBase
  {
    readonly IIdleRepository idleRepo;
    readonly ICCMRepository ccmRepo;
    public IdleController(IIdleRepository repo, ICCMRepository ccmRepo)
    {
      idleRepo = repo;
      this.ccmRepo = ccmRepo;
    }

    ///// GET: api/Idle/GetMinMaxDates
    [HttpGet("GetMinMaxDates")]
    public async Task<IActionResult> GetMinMaxDates()
    {
      try
      {
        var dates = await idleRepo.GetMinMaxDates();
        return Ok(dates);
      }
      catch (Exception ex) { return BadRequest(ex.Message); }
    }

    ///// GET: api/Idle/GetShops
    [HttpGet("GetShops")]
    public async Task<IActionResult> GetShops()
    {
      try
      {
        var shops = await idleRepo.GetShops();
        return Ok(shops);
      }
      catch (Exception ex) { return BadRequest(ex.Message); }
    }

    ///// GET: api/Idle/GetIdles?bDate=...&eDate=...&ceh=...
    [HttpGet("GetIdles")]
    public async Task<IActionResult> GetIdles(string bDate, string eDate, string ceh)
    {
      try
      {
        var idles = await idleRepo.GetIdles(bDate, eDate, ceh);
        return Ok(idles);
      }
      catch (Exception ex) { return BadRequest(ex.Message); }
    }

    ///// GET: api/Idle/GetCcmIdleDowntimeWeight?bDate=...&eDate=...&ccmNo=...
    [HttpGet("GetCcmIdleDowntimeWeight")]
    public async Task<IActionResult> GetCcmIdleDowntimeWeight(string bDate, string eDate, int ccmNo)
    {
      try
      {
        await Task.Yield();
        WebClient client = new WebClient();
        client.UseDefaultCredentials = true;
        string content = client.DownloadString($"http://10.2.59.20:81/api/Idle/GetCcmIdleDowntimeWeight?bDate={bDate}&eDate={eDate}&ccmNo={ccmNo}");

        return Ok(content);
      }
      catch (Exception ex) { return BadRequest(ex.Message); }
    }
  }
}