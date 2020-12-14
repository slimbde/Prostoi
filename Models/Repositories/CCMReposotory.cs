using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using Oracle.ManagedDataAccess.Client;
using react_ts.Models.Repositories;
using rest_ts_react_template.Models.DTOs;

namespace rest_ts_react_template.Models.Repositories
{
  ////////////////////////////////////////////////////////// ICCMRepository
  public interface ICCMRepository : IRepository<LostIdle>
  {
    Task<IEnumerable<LostIdle>> GetMNLZ5LostIdles(string begin, string end);
  }



  ///////////////////////////////////////////////////////// CCMRepository
  public class CCMRepository : ICCMRepository
  {
    protected OracleConnection _db5;
    protected OracleConnection _db2;


    public CCMRepository(string ccm5L2String, string ccm2L2String)
    {
      _db5 = new OracleConnection(ccm5L2String);
      _db2 = new OracleConnection(ccm2L2String);
    }

    public Task<int> Delete(Guid id) =>
      throw new NotImplementedException();

    public Task<LostIdle> Get(Guid id) =>
      throw new NotImplementedException();

    public Task<IEnumerable<LostIdle>> GetList() =>
      throw new NotImplementedException();

    ////////////////// GET MNLZ 5 LOST IDLES
    public async Task<IEnumerable<LostIdle>> GetMNLZ5LostIdles(string begin, string end)
    {
      var stmt = @"
        WITH p AS (
          SELECT 
          TO_DATE(:bDate,'YYYY-MM-DD')                      startT, 
          TO_DATE(:eDate,'YYYY-MM-DD') + interval '1' day    stopT 
          FROM dual
        )
        SELECT 
          outtr.STOP_DATE as day,										
          outtr.steel_grade_id as mark,
          outtr.practice_id as pId, 										
          L2PRD.CCM_GENERAL_PROGRAM_VARS.NUMERIC_VALUE as density,	
          L2PRD.REP_CCM_PRODUCT_ORDERS.WIDTH as width,						
          L2PRD.REP_CCM_PRODUCT_ORDERS.THICKNESS as thickness,		
          --DELAYS.timeinterval as realinterval,
          CASE WHEN DELAYS.timeinterval < 0 THEN 0 ELSE ROUND(DELAYS.timeinterval * 5, 0) END as count
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
          FROM 
            (
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
            FROM 
              (
            SELECT delay_start_time, 																	
              COALESCE(NULLIF(delay_stop_time, TO_DATE('01-01-1970', 'DD-MM-YYYY')), SYSDATE) as delay_stop_time,																	
              delay_start_time + INTERVAL '4' hour + INTERVAL '30' minute as delay_start_shift,	
              COALESCE(NULLIF(delay_stop_time, TO_DATE('01-01-1970', 'DD-MM-YYYY')), SYSDATE) + INTERVAL '4' hour + INTERVAL '30' minute as delay_stop_shift		
            FROM L2PRD.REP_DELAYS, p
            WHERE 
              (DELAY_START_TIME + INTERVAL '4' hour + INTERVAL '30' minute >= p.startT
              AND DELAY_START_TIME + INTERVAL '4' hour + INTERVAL '30' minute < p.stopT)
                  OR
                  (DELAY_STOP_TIME + INTERVAL '4' hour + INTERVAL '30' minute >= p.startT
              AND DELAY_STOP_TIME + INTERVAL '4' hour + INTERVAL '30' minute < p.stopT)
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
      ";

      var result = new List<LostIdle>();

      try
      {
        await _db5.OpenAsync();

        var cmd = new OracleCommand(stmt, _db5);
        cmd.Parameters.Add("bDate", begin);
        cmd.Parameters.Add("eDate", end);

        var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
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

        cmd.CommandText = @"
          WITH p as (
            select 
              TO_DATE(:bDate,'YYYY-MM-DD')                       startT, 
              TO_DATE(:eDate,'YYYY-MM-DD') + interval '1' day    stopT 
            from dual
          )
          SELECT 
            outtr.STOP_DATE,
            --outtr.steel_grade_id, 
            --outtr.practice_id, 
            CCM_GENERAL_PROGRAM_VARS.NUMERIC_VALUE DENSITY,
            REP_CCM_PRODUCT_ORDERS.WIDTH,
            REP_CCM_PRODUCT_ORDERS.THICKNESS,
            case when DELAYS.Undercast_length < 0 then 0 else ROUND(DELAYS.Undercast_length, 15) end as UNDERCAST_LENGTH --(mm)
          FROM (   
            SELECT STOP_DATE,
              MAX(innr.cnt) KEEP (DENSE_RANK LAST ORDER BY cnt) cnt,
              MAX(innr.REPORT_COUNTER)  KEEP (DENSE_RANK LAST ORDER BY cnt) REPORT_COUNTER,
              MAX(innr.PRACTICE_ID)  KEEP (DENSE_RANK LAST ORDER BY cnt) PRACTICE_ID,
              MAX(innr.STEEL_GRADE_ID)  KEEP (DENSE_RANK LAST ORDER BY cnt) STEEL_GRADE_ID
            FROM (   
              SELECT STOP_DATE,
                STEEL_GRADE_ID,
                PRACTICE_ID,
                MIN(REPORT_COUNTER) REPORT_COUNTER,
                COUNT(*) cnt
              FROM (
                SELECT steel_grade_id,
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
          ON L2PRD.CCM_GENERAL_PROGRAM_VARS.PRACTICE_ID = outtr.practice_id AND L2PRD.CCM_GENERAL_PROGRAM_VARS.VAR_CODE = 52003 AND AREA_ID = 1100
          JOIN L2PRD.REP_CCM_PRODUCT_ORDERS
          ON outtr.REPORT_COUNTER = REP_CCM_PRODUCT_ORDERS.REPORT_COUNTER
          JOIN (
            SELECT delayDate,
              sum(Undercast_length) as Undercast_length --(mm)
            FROM (
              SELECT TRUNC(startS, 'DDD') as delayDate,
                startS as startShifted,
                stopS as stopShifted,
                startS - INTERVAL '4' hour - INTERVAL '30' minute as startTime,
                stopS - INTERVAL '4' hour - INTERVAL '30' minute as stopTime ,
                Undercast_length
              FROM (
                with rws as (
                  select rownum r from dual connect by level <= 2
                )
                SELECT Undercast_length,
                  case r
                    when 1 then TRUNC(delay_stop_shift, 'DDD')
                    else delay_start_shift
                    end as startS,
                  case r
                    when 2 then 
                    CASE 
                      WHEN EXTRACT(DAY from cast(delay_start_shift as timestamp)) <> EXTRACT(DAY from cast(delay_stop_shift as timestamp))  
                      THEN TRUNC(delay_stop_shift, 'DDD')
                    else delay_stop_shift
                    END
                  else delay_stop_shift  
                  end as stopS
                FROM (
                  SELECT (length_at_end - length_at_beginning) * (  -0.01 *percentage_of_deviation / (1-0.01 * percentage_of_deviation)) as Undercast_length,
                    start_downtime, 
                    end_downtime,
                    start_downtime + INTERVAL '4' hour + INTERVAL '30' minute as delay_start_shift,
                    end_downtime + INTERVAL '4' hour + INTERVAL '30' minute as delay_stop_shift
                  FROM L2PRD.REP_CCM_DOWNTIME, p
                  WHERE  (start_downtime + INTERVAL '4' hour + INTERVAL '30' minute >= p.startT
                AND start_downtime + INTERVAL '4' hour + INTERVAL '30' minute < p.stopT)
                    OR
                    (end_downtime + INTERVAL '4' hour + INTERVAL '30' minute >= p.startT
                AND end_downtime + INTERVAL '4' hour + INTERVAL '30' minute < p.stopT)
                )
                JOIN rws on case 
                      when EXTRACT(DAY from cast(delay_start_shift as timestamp)) = EXTRACT(DAY from cast(delay_stop_shift as timestamp)) 
                      then 2 
                      else 1 
                      end <= rws.r
              )
            )
            GROUP BY delayDate 
          ) DELAYS 
          ON DELAYS.delayDate = STOP_DATE 
          ORDER BY STOP_DATE 
        ";

        reader = cmd.ExecuteReader();
        while (reader.Read())
        {
          DateTime date = Convert.ToDateTime(reader["STOP_DATE"]);
          double length = Convert.ToDouble(reader["UNDERCAST_LENGTH"]);
          int width = Convert.ToInt32(reader["WIDTH"]);
          int thickness = Convert.ToInt32(reader["THICKNESS"]);
          int density = Convert.ToInt32(reader["DENSITY"]);

          LostIdle idle = result.Find(li => li.Day == date);
          if (idle != null)
          {
            idle.UndercastLength = length;
            idle.UndercastWidth = width;
            idle.UndercastThickness = thickness;
            idle.UndercastDensity = density;
          }
        }

        return result;
      }
      finally { await _db5.CloseAsync(); }
    }

    public Task<int> Post(LostIdle obj) =>
      throw new NotImplementedException();

    public Task<Guid> Put(LostIdle obj) =>
      throw new NotImplementedException();
  }
}