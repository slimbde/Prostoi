using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories.Interfaces;

namespace Prostoi.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UsageController : ControllerBase
  {
    private readonly IUsageLogRepository _repo;
    public UsageController(IUsageLogRepository repo) => _repo = repo;



    /////////////////////////////// GET: api/Usage/GetUsageIps
    [HttpGet("{action}")]
    public async Task<ActionResult<IEnumerable<string>>> GetUsageIps()
    {
      try { return Ok(await _repo.GetIps()); }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }

    /////////////////////////////// GET: api/Usage/GetUsageFor?bDate=...&eDate=...&ip=...
    [HttpGet("{action}")]
    public async Task<ActionResult<IEnumerable<UsageLog>>> GetUsageFor(string bDate, string eDate, string ip)
    {
      try { return Ok(await _repo.GetFor(bDate, eDate, ip)); }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
  }
}