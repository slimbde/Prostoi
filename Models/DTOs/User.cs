using System;

namespace react_ts.Models.DTOs
{
  public class User
  {
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Login { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public Guid RoleId { get; set; }
  }
}
