using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using react_ts.Models.Repositories;

namespace react_ts.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class TController<T> : Controller where T : class
  {
    protected IRepository<T> _repo;
    public TController(IRepository<T> repo) => _repo = repo;



    ///// GET: api/T
    [HttpGet]
    public async Task<IEnumerable<T>> GetList() => await _repo.GetList();


    ///// GET: api/T/5
    [HttpGet("{id}")]
    public async Task<ActionResult<T>> Get(Guid id)
    {
      var obj = await _repo.Get(id);

      if (obj == null)
        return NotFound(new { error = $"No user has id '{id}'" });

      return Ok(obj);
    }


    ///// PUT: api/T
    [HttpPut]
    public async Task<IActionResult> Put(T obj)
    {
      if (ModelState.IsValid)
      {
        Guid id = default;

        try
        {
          id = await _repo.Put(obj);
          return Ok(id);
        }
        catch (Exception ex) { return BadRequest(new { error = ex.Message }); }

      }

      return BadRequest(new { error = ModelState });
    }


    ///// POST: api/T
    [HttpPost]
    public async Task<ActionResult> Post(T obj)
    {
      try
      {
        var numChanged = await _repo.Post(obj);
        if (numChanged > 0)
          return Ok(numChanged);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }

      return BadRequest(new { error = "Something's gone wrong" });
    }


    ///// DELETE: api/T/5
    [HttpDelete("{id}")]
    public async Task<ActionResult<T>> Delete(Guid id)
    {
      var numDeleted = await _repo.Delete(id);
      if (numDeleted > 0)
        return Ok(numDeleted);

      return NotFound(new { error = $"No user has id '{id}'" });
    }

  }
}
