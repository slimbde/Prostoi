using System;
using System.Collections.Generic;
using System.Data;
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
      var query = @"insert Users (Name, Email, Password)
                    output inserted.Id
                    values (@Name, @Email, @Password)";

      return await _db.QuerySingleAsync<Guid>(query, obj);
    }

    public async Task<int> SetUserRole(Guid UserId, Guid RoleId)
    {
      var query = @"update Users set RoleId=@RoleId where Id=@UserId";
      return await _db.ExecuteAsync(query, new { RoleId = RoleId, UserId = UserId });
    }
  }
}