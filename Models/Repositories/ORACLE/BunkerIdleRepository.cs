using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Oracle.ManagedDataAccess.Client;
using Prostoi.Models.DTOs;
using Prostoi.Models.Repositories.Interfaces;


namespace Prostoi.Models.Repositories.ORACLE
{
  public class BunkerIdleRepository : IIdleRepository
  {
    string conString;
    IDbAdapter _adapter;

    public BunkerIdleRepository(string conString, IDbAdapter adapter)
    {
      _adapter = adapter;
      this.conString = conString;
    }


    public async Task<IEnumerable<string>> GetMinMaxDates()
    {
      string stmt = @"SELECT 
                        MIN(TEH_SUT)      min,
                        MAX(TEH_SUT) +1   max
                      FROM KEEPER.PROSTOI";

      using (IDbConnection db = new OracleConnection(conString))
        return await db.QueryAsync<string>(stmt);
    }
    public async Task<IEnumerable<string>> GetShops()
    {
      string stmt = "SELECT DISTINCT NAM_CEH FROM KEEPER.PROSTOI WHERE NAM_CEH IS NOT NULL ORDER BY NAM_CEH";

      using (IDbConnection db = new OracleConnection(conString))
      {
        IEnumerable<string> shops = await db.QueryAsync<string>(stmt);
        return _adapter.AdaptShops(shops);
      }
    }
    public async Task<dynamic> GetIdles(string begin, string end, string ceh)
    {
      string stmt = @"SELECT
                    nam_ceh
                    ,pltxt
                    ,eauszt
                    ,opertext
                    ,proiz
                    ,case when smEnd - sPoint > 0 then sPoint else sPoint-1 end                                                  sPoint
                    ,case when smEnd - sPoint > 0 then sPoint + eauszt/24/60 else (sPoint-1) + eauszt/24/60 end                  ePoint
                    ,to_char( case when smEnd - sPoint > 0 then sPoint else sPoint-1 end , 'dd.MM.yyyy HH24:mi')                 sPointCorrect
                    ,to_char( case when smEnd - sPoint > 0 then sPoint else sPoint-1 end + eauszt/24/60 , 'dd.MM.yyyy HH24:mi')  ePointCorrect
                  FROM (
                    SELECT DISTINCT
                      nam_ceh
                      ,pltxt
                      ,eauszt
                      ,opertext
                      ,proiz
                      ,teh_sut + to_char(auztv,'hh24')/24 + to_char(auztv,'mi')/24/60               sPoint
                      ,decode(nam_ceh, 'Аглопроизводство', teh_sut + 20/24, teh_sut + 19.5/24)      smEnd
                    FROM keeper.prostoi
                    WHERE
                      nam_ceh LIKE '%' || :ceh || '%'
                      AND teh_sut	between to_date(:bDate,'yyyy-MM-dd') AND to_date(:eDate,'yyyy-MM-dd')
                  )
                  ORDER BY sPoint";

      using (IDbConnection db = new OracleConnection(conString))
      {
        IEnumerable<dynamic> raw = await db.QueryAsync(stmt, new { bDate = begin, eDate = end, ceh });

        var res = raw
          .Select(r => new Idle
          {
            Ceh = r.NAM_CEH?.ToString(),
            Agreg = r.PLTXT?.ToString(),
            Culprit = r.OPERTEXT?.ToString(),
            BeginDate = DateTime.TryParse(r.SPOINT?.ToString(), out DateTime dt) ? dt : DateTime.Now,
            EndDate = DateTime.TryParse(r.EPOINT?.ToString(), out DateTime dt2) ? dt2 : DateTime.Now,
            Duration = double.TryParse(r.EAUSZT?.ToString(), out double dur) ? dur : 0.0,
            FullBeginDate = r.SPOINTCORRECT?.ToString(),
            FullEndDate = r.EPOINTCORRECT?.ToString(),
            Proiz = double.TryParse(r.PROIZ?.ToString(), out double pr) ? pr : 0.0,
          })
        .GroupBy(one => one.Ceh)
        .ToDictionary(group => group.Key, group => group
                                                    .GroupBy(one => one.Agreg)
                                                    .ToDictionary(group => group.Key, group => group.ToList()));

        var adapted = _adapter.AdaptIdles(res);
        return adapted;
      }
    }
  }
}