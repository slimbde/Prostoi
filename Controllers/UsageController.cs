using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories;

namespace Prostoi.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UsageController : ControllerBase
  {
    private readonly IUsageLogRepository _repo;
    public UsageController(IUsageLogRepository repo) => _repo = repo;



    /////////////////////////////// GET: api/Usage/GetUsageIps
    [HttpGet("GetUsageIps")]
    public async Task<ActionResult<IEnumerable<string>>> GetUsageIps()
    {
      try { return Ok(await _repo.GetIps()); }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    /////////////////////////////// GET: api/Usage/GetUsageFor?what=...
    [HttpGet("GetUsageFor")]
    public async Task<ActionResult<IEnumerable<UsageLog>>> GetUsageFor(string what)
    {
      try { return Ok(await _repo.GetFor(what)); }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    /////////////////////////////// GET: api/Usage/GetUsageFor?dt=...&ip=...
    [HttpGet("GetUsageForAll")]
    public async Task<ActionResult<IEnumerable<UsageLog>>> GetUsageForAll(string dt, string ip)
    {
      try { return Ok(await _repo.GetForAll(dt, ip)); }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
  }
}