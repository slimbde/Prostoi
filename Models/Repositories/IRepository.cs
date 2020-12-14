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
}