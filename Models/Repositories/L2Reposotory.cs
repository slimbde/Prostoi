using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using react_ts.Models.Repositories;
using rest_ts_react_template.Models.DTOs;

namespace rest_ts_react_template.Models.Repositories
{
  public interface IL2Repository : IRepository<LostIdle>
  {
    Task<IEnumerable<LostIdle>> GetMNLZ5LostIdles(string begin, string end);
  }

  public class L2Repository : IL2Repository
  {
    protected OracleConnection _db;
    public L2Repository(string conString) => _db = new OracleConnection(conString);

    public Task<int> Delete(Guid id) =>
      throw new NotImplementedException();

    public Task<LostIdle> Get(Guid id) =>
      throw new NotImplementedException();

    public Task<IEnumerable<LostIdle>> GetList() =>
      throw new NotImplementedException();

    ////////////////// GET MNLZ 5 LOST IDLES
    public async Task<IEnumerable<LostIdle>> GetMNLZ5LostIdles(string begin, string end)
    {
      var stmt = string.Format(@"
        with p as (
          select 
            TO_DATE('{0}','YYYY-MM-DD')                      startT, 
            TO_DATE('{1}','YYYY-MM-DD')+ interval '1' day    stopT 
          from dual
        )
        SELECT 
          outtr.STOP_DATE as day,										
          outtr.steel_grade_id as mark,
          outtr.practice_id as pId, 										
          L2PRD.CCM_GENERAL_PROGRAM_VARS.NUMERIC_VALUE as density,	
          L2PRD.REP_CCM_PRODUCT_ORDERS.WIDTH as width,						
          L2PRD.REP_CCM_PRODUCT_ORDERS.THICKNESS as thickness,					
          ROUND(DELAYS.timeinterval * 5, 0) as count
        FROM ( 
          SELECT 
            STOP_DATE,
            MAX(innr.cnt) KEEP (DENSE_RANK LAST ORDER BY cnt) cnt,
            MAX(innr.REPORT_COUNTER) KEEP (DENSE_RANK LAST ORDER BY cnt) REPORT_COUNTER,
            MAX(innr.PRACTICE_ID) KEEP (DENSE_RANK LAST ORDER BY cnt) PRACTICE_ID,
            MAX(innr.STEEL_GRADE_ID) KEEP (DENSE_RANK LAST ORDER BY cnt) STEEL_GRADE_ID
          FROM ( 
            SELECT 
              STOP_DATE,
              STEEL_GRADE_ID,
              PRACTICE_ID,
              MIN(REPORT_COUNTER) REPORT_COUNTER,
              COUNT(*) cnt
            FROM (
              SELECT 
                steel_grade_id,
                practice_id,
                TRUNC(STOP_DATE + INTERVAL '4' hour + INTERVAL '30' minute, 'DDD') as STOP_DATE,
                report_counter
              FROM L2PRD.REPORTS, p
              WHERE 
                STOP_DATE + INTERVAL '4' hour + INTERVAL '30' minute >= p.startT
				        and STOP_DATE + INTERVAL '4' hour + INTERVAL '30' minute < p.stopT
            )
            GROUP BY STOP_DATE, steel_grade_id, practice_id
          ) innr 
          GROUP BY STOP_DATE
        ) outtr

        JOIN L2PRD.CCM_GENERAL_PROGRAM_VARS
          ON L2PRD.CCM_GENERAL_PROGRAM_VARS.PRACTICE_ID = outtr.practice_id 
          AND L2PRD.CCM_GENERAL_PROGRAM_VARS.VAR_CODE = 52003 
          AND AREA_ID = 1100

        JOIN L2PRD.REP_CCM_PRODUCT_ORDERS
          ON outtr.REPORT_COUNTER = REP_CCM_PRODUCT_ORDERS.REPORT_COUNTER

        JOIN (
          SELECT 
            delayDate,
            sum(timeinterval) as timeinterval
          FROM (
            SELECT 
              TRUNC(startS, 'DDD') as delayDate,
              startS as startShifted,
              stopS as stopShifted,
              startS - INTERVAL '4' hour - INTERVAL '30' minute as startTime,
              stopS - INTERVAL '4' hour - INTERVAL '30' minute as stopTime,
              (stopS - startS) * 24 * 60 * 60 as timeinterval
            FROM (
              WITH rws as (
                select 
                  rownum r 
                from dual 
                connect by level <= 2
              )
              SELECT 
                CASE r
                  WHEN 1 THEN TRUNC(delay_stop_shift, 'DDD')
                  ELSE delay_start_shift
                END as startS,
                
                CASE r
                  WHEN 2 THEN 
                    CASE 
                      WHEN EXTRACT(DAY from cast(delay_start_shift as timestamp)) <> EXTRACT(DAY from cast(delay_stop_shift as timestamp)) THEN TRUNC(delay_stop_shift, 'DDD')
                      ELSE delay_stop_shift
                    END
                  ELSE delay_stop_shift
                END as stopS
              FROM (
                SELECT 
                  delay_start_time, 																	
                  delay_stop_time,																	
                  delay_start_time + INTERVAL '4' hour + INTERVAL '30' minute as delay_start_shift,	
                  delay_stop_time + INTERVAL '4' hour + INTERVAL '30' minute as delay_stop_shift		
                FROM L2PRD.REP_DELAYS, p
                WHERE 
                  delay_start_time + INTERVAL '4' hour + INTERVAL '30' minute >= p.startT	
					        AND delay_start_time + INTERVAL '4' hour + INTERVAL '30' minute < p.stopT
              )	
                
              JOIN rws 
                on CASE
                  WHEN EXTRACT(DAY from cast(delay_start_shift as timestamp)) = EXTRACT(DAY from cast(delay_stop_shift as timestamp)) THEN 2 		
                  ELSE 1 																															
                END <= rws.r
            )
          )
          GROUP BY delayDate 
        ) DELAYS 

        ON DELAYS.delayDate = STOP_DATE 
        ORDER BY STOP_DATE 
      ", begin, end);

      var result = new List<LostIdle>();

      try
      {
        await _db.OpenAsync();
        var cmd = new OracleCommand(stmt, _db);
        var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
          var c = reader["COUNT"];

          var lostIdle = new LostIdle
          {
            Day = Convert.ToDateTime(reader["DAY"]),
            Mark = reader["MARK"].ToString(),
            PId = reader["PID"].ToString(),
            Density = Convert.ToInt32(reader["DENSITY"]),
            Width = Convert.ToInt32(reader["WIDTH"]),
            Thickness = Convert.ToInt32(reader["THICKNESS"]),
            Count = Convert.ToUInt64(reader["COUNT"])
          };

          result.Add(lostIdle);
        }

        return result;
      }
      finally { await _db.CloseAsync(); }
    }

    public Task<int> Post(LostIdle obj) =>
      throw new NotImplementedException();

    public Task<Guid> Put(LostIdle obj) =>
      throw new NotImplementedException();
  }
}