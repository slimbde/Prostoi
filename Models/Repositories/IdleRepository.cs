using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using rest_ts_react_template.Models.DTOs;

namespace rest_ts_react_template.Models.Repositories
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
    public IdleRepository(string conString) => _db = new OracleConnection(conString);

    ///////////////////////// GET MIN MAX DATES
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

    ///////////////// GET SHOPS
    public async Task<IEnumerable<string>> GetShops()
    {
      var stmt = "SELECT DISTINCT NAM_CEH FROM KEEPER.PROSTOI WHERE NAM_CEH IS NOT NULL ORDER BY NAM_CEH";
      var shops = new List<string>();

      try
      {
        await _db.OpenAsync();
        var cmd = new OracleCommand(stmt, _db);
        var reader = cmd.ExecuteReader();

        while (reader.Read())
          shops.Add(reader[0].ToString());
      }
      finally { await _db.CloseAsync(); }

      return shops;
    }

    ////////////////// GET IDLES
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
                    nam_ceh = t.ceh
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
        var reader = cmd.ExecuteReader();

        while (reader.Read())
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
      }
      catch (Exception ex)
      {
        var msg = ex.Message;
        if (ex.InnerException != null)
          msg += "\nInner: " + ex.InnerException.Message;

        throw new Exception(msg);
      }
      finally { await _db.CloseAsync(); }

      return result;
    }
  }
}