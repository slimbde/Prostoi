using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using react_ts.Models.DTOs;
using react_ts.Models.Repositories;

namespace react_ts.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class UserController : TController<User>
  {
    private readonly IUserRepository _auth;
    public UserController(IUserRepository repo) : base(repo) { _auth = repo; }


    ///// GET: api/User/Authenticate?Login=...&Password=...
    [HttpGet("Authenticate")]
    public async Task<IActionResult> Authenticate(string Login, string Password)
    {
      var users = await _repo.GetList();

      try
      {
        var user = users.First(u => u.Login == Login && u.Password == Password);
        var role = await _auth.GetUserRole(user.Id);
        return Ok(new { user = user, role = role });
      }
      catch (Exception ex) { return BadRequest(new { error = $"Authenticate: {ex.Message }" }); }
    }


    ///// GET: api/User/GetUserRole/5
    [HttpGet("GetUserRole/{id}")]
    public async Task<IActionResult> GetUserRole(Guid id)
    {
      try
      {
        var role = await _auth.GetUserRole(id);
        return Ok(role);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }


    ///// GET: api/User/GetRoles
    [HttpGet("GetRoles")]
    public async Task<IActionResult> GetRoles()
    {
      try
      {
        var roles = await _auth.GetRoles();
        return Ok(roles);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }


    ///// GET: api/User/SetUserRole?UserId=...&RoleId=...
    [HttpGet("SetUserRole")]
    public async Task<IActionResult> SetUserRole(Guid UserId, Guid RoleId)
    {
      try
      {
        var result = await _auth.SetUserRole(UserId, RoleId);
        return Ok(result);
      }
      catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
    }
  }
}