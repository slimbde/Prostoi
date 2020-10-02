using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;


namespace rest_ts_react_template.Models.Repositories
{
  public interface IIdleRepository
  {
    Task<IEnumerable<string>> GetMinMaxDates();
  }



  public class IdleRepository : IIdleRepository
  {
    protected OracleConnection _db;

    public IdleRepository(string conString) => _db = new OracleConnection(conString);

    public async Task<IEnumerable<string>> GetMinMaxDates()
    {
      try
      {
        var query = @"SELECT 
                          MIN(TEH_SUT) min,
                          MAX(TEH_SUT) +1 max
                      FROM KEEPER.PROSTOI";

        var cmd = new OracleCommand(query, _db);

        await _db.OpenAsync();
        var reader = cmd.ExecuteReader();

        var result = new List<string>();

        while (reader.Read())
        {
          result.Add(Convert.ToDateTime(reader["min"]).ToString("yyyy-MM-dd"));
          result.Add(Convert.ToDateTime(reader["max"]).ToString("yyyy-MM-dd"));
        }

        return result;
      }
      finally { await _db.CloseAsync(); }
    }
  }
}