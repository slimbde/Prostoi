using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using react_ts.Models.DTOs;

namespace react_ts.Models.Repositories
{
  public interface IUserRepository : IRepository<User>
  {
    Task<IEnumerable<Role>> GetRoles();
    Task<Role> GetUserRole(Guid id);
    Task<int> SetUserRole(Guid UserId, Guid RoleId);
  }

  public class UserRepository : IUserRepository
  {
    protected IDbConnection _db;
    public UserRepository(string conString) => _db = new SqlConnection(conString);

    public async Task<int> Delete(Guid id) => await _db.ExecuteAsync($"delete from Users where Id=@id", new { id });

    public async Task<User> Get(Guid id) => await _db.QueryFirstOrDefaultAsync<User>($"select * from Users where Id=@id", new { id });

    public async Task<IEnumerable<User>> GetList() => await _db.QueryAsync<User>($"select * from Users");

    public async Task<IEnumerable<Role>> GetRoles() => await _db.QueryAsync<Role>($"select * from Roles");

    public async Task<Role> GetUserRole(Guid id) => await _db.QueryFirstOrDefaultAsync<Role>($"select * from Roles where Id=(select RoleId from Users where Id=@id)", new { id });

    public async Task<int> Post(User obj)
    {
      var query = @"update Users set 
                      Name=@Name,
                      Email=@Email,
                      Password=@Password,
                      RoleId=@RoleId
                    where Id=@Id";

      return await _db.ExecuteAsync(query, obj);
    }

    public async Task<Guid> Put(User obj)
    {
      try
      {
        _db.Open();
        var users = await this.GetList();

        if (users.Any(u => u.Login == obj.Login)) throw new Exception("Login isn't unique");
        if (users.Any(u => u.Email == obj.Email)) throw new Exception("Email isn't unique");

        var query = @"insert Users (Name, Login, Email, Password)
                    output inserted.Id
                    values (@Name, @Login, @Email, @Password)";

        return await _db.QuerySingleAsync<Guid>(query, obj);
      }
      finally { _db.Close(); }
    }

    public async Task<int> SetUserRole(Guid UserId, Guid RoleId)
    {
      var query = @"update Users set RoleId=@RoleId where Id=@UserId";
      return await _db.ExecuteAsync(query, new { RoleId = RoleId, UserId = UserId });
    }
  }
}