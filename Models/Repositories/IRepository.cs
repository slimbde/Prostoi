using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;

namespace react_ts.Models.Repositories
{
  public interface IRepository<T> where T : class
  {
    Task<Guid> Put(T obj);
    Task<int> Post(T obj);
    Task<T> Get(Guid id);
    Task<IEnumerable<T>> GetList();
    Task<int> Delete(Guid id);
  }




  public abstract class TRepository<T> : IRepository<T> where T : class
  {
    protected IDbConnection _db;
    protected string _table;
    public TRepository(string conString, string tableName)
    {
      _db = new SqlConnection(conString);
      _table = tableName;
    }


    public async Task<int> Delete(Guid id) => await _db.ExecuteAsync($"delete from {_table} where Id=@id", new { id });

    public async Task<T> Get(Guid id) => await _db.QueryFirstOrDefaultAsync<T>($"select * from {_table} where Id=@id", new { id });

    public async Task<IEnumerable<T>> GetList() => await _db.QueryAsync<T>($"select * from {_table}");

    public abstract Task<int> Post(T obj);

    public abstract Task<Guid> Put(T obj);
  }
}