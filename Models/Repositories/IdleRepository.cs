using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using Prostoi.Models;
using react_ts.Models.DTOs;

namespace react_ts.Models.Repositories
{
  public interface IIdleRepository
  {
    Task<IEnumerable<string>> GetMinMaxDates();
    Task<IEnumerable<string>> GetShops();
    Task<Dictionary<string, SortedDictionary<string, List<Idle>>>> GetIdles(string begin, string end, string ceh);
  }



  public class IdleRepository : IIdleRepository
  {
    protected OracleConnection _db;
    protected IDbAdapter _adapter;
    public IdleRepository(string conString, IDbAdapter adapter)
    {
      _db = new OracleConnection(conString);
      _adapter = adapter;
    }


    public async Task<IEnumerable<string>> GetMinMaxDates()
    {
      try
      {
        var query = @"SELECT 
                          MIN(TEH_SUT)      min,
                          MAX(TEH_SUT) +1   max
                      FROM KEEPER.PROSTOI";

        var cmd = new OracleCommand(query, _db);

        await _db.OpenAsync();
        var reader = await cmd.ExecuteReaderAsync();

        var result = new List<string>();

        while (await reader.ReadAsync())
        {
          result.Add(Convert.ToDateTime(reader["min"]).ToString("yyyy-MM-dd"));
          result.Add(Convert.ToDateTime(reader["max"]).ToString("yyyy-MM-dd"));
        }

        return result;
      }
      finally { await _db.CloseAsync(); }
    }
    public async Task<IEnumerable<string>> GetShops()
    {
      List<string> shops = new List<string>();

      string stmt = "SELECT DISTINCT NAM_CEH FROM KEEPER.PROSTOI WHERE NAM_CEH IS NOT NULL ORDER BY NAM_CEH";
      DbCommand cmd = new OracleCommand(stmt, _db);

      try
      {
        _db.Open();
        DbDataReader reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
          shops.Add(reader[0].ToString());

        return _adapter.AdaptShops(shops);
      }
      finally { await _db.CloseAsync(); }
    }
    public async Task<Dictionary<string, SortedDictionary<string, List<Idle>>>> GetIdles(string begin, string end, string ceh)
    {
      var stmt = @"
                WITH t AS (
	                SELECT 
                    to_date(:bDate,'yyyy-MM-dd')  start_point, 
                    to_date(:eDate,'yyyy-MM-dd')  end_point,
                    :ceh                          ceh
                  FROM dual
                ),
                temp AS (
                  SELECT DISTINCT
                    nam_ceh, pltxt, eauszt, opertext, proiz,
                    teh_sut	+ to_char(auztv,'hh24')/24 + to_char(auztv,'mi')/24/60              sPoint,
                    decode(nam_ceh, 'Аглопроизводство', teh_sut + 20/24, teh_sut + 19.5/24)     smEnd
                  FROM keeper.prostoi, t
                  WHERE
                    nam_ceh LIKE '%' || t.ceh || '%'
                    and teh_sut	between t.start_point and t.end_point
                )
                SELECT
                  nam_ceh, pltxt, eauszt, opertext, proiz,
                  case when smEnd - sPoint > 0 then sPoint else sPoint-1 end                                                  sPoint,
                  case when smEnd - sPoint > 0 then sPoint + eauszt/24/60 else (sPoint-1) + eauszt/24/60 end                  ePoint,
                  to_char( case when smEnd - sPoint > 0 then sPoint else sPoint-1 end , 'dd.MM.yyyy HH24:mi')                 sPointCorrect,
                  to_char( case when smEnd - sPoint > 0 then sPoint else sPoint-1 end + eauszt/24/60 , 'dd.MM.yyyy HH24:mi')  ePointCorrect
                FROM temp
                ORDER BY sPoint";

      var result = new Dictionary<string, SortedDictionary<string, List<Idle>>>();

      try
      {
        var cmd = new OracleCommand(stmt, _db);
        cmd.Parameters.Add("bDate", begin);
        cmd.Parameters.Add("eDate", end);
        cmd.Parameters.Add("ceh", ceh);

        await _db.OpenAsync();
        var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
          var idle = new Idle
          {
            Ceh = reader["NAM_CEH"].ToString(),
            Agreg = reader["PLTXT"].ToString(),
            Culprit = reader["OPERTEXT"].ToString(),
            BeginDate = Convert.ToDateTime(reader["sPoint"]),
            EndDate = Convert.ToDateTime(reader["ePoint"]),
            Duration = Convert.ToDouble(reader["EAUSZT"]),
            FullBeginDate = reader["sPointCorrect"].ToString(),
            FullEndDate = reader["ePointCorrect"].ToString(),
            Proiz = (reader["PROIZ"] is DBNull) ? 0.0 : Convert.ToDouble(reader["PROIZ"]),
          };

          if (!result.ContainsKey(idle.Ceh))
            result[idle.Ceh] = new SortedDictionary<string, List<Idle>>();

          if (!result[idle.Ceh].ContainsKey(idle.Agreg))
            result[idle.Ceh][idle.Agreg] = new List<Idle>();

          result[idle.Ceh][idle.Agreg].Add(idle);
        }

        return _adapter.AdaptIdles(result);
      }
      catch (Exception ex)
      {
        var msg = ex.Message;
        if (ex.InnerException != null)
          msg += "\nInner: " + ex.InnerException.Message;

        throw new Exception(msg);
      }
      finally { await _db.CloseAsync(); }
    }
  }
}