using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Oracle.ManagedDataAccess.Client;
using Prostoi.Models.Repositories.Interfaces;

namespace Prostoi.Models.Repositories.ORACLE
{
  /// <summary>
  /// CCM Repository instance
  /// </summary>
  public class CCMRepository : ICCMRepository
  {
    IDictionary<int, string> conStrings;
    IDictionary<int, string> schemas;

    public CCMRepository(IDictionary<int, string> ccmConStrings)
    {
      this.conStrings = ccmConStrings;

      this.schemas = new Dictionary<int, string>() {
        {2,"MS_MECHEL_ESPC6_SC2"},
        {3,"LEV2_RT"},
        {4,"MECHEL"},
        {5,"L2PRD"},
      };
    }



    public async Task<dynamic> GetCcmIdleDowntimeWeight(string bDate, string eDate, int ccmNo)
    {
      if (ccmNo == 2 || ccmNo == 5)
      {
        using (IDbConnection db = new OracleConnection(conStrings[ccmNo]))
        {
          string schema = schemas[ccmNo];

          string stmt = $@"SELECT
                            days.SHIFT
                            --,gg.STEEL_GRADE_ID  -- для проверки
                            --,po.PROFILE_ID      -- для проверки
                            --,gp.PLAN_SP         -- для проверки
                            --,ROUND(idles.HOURS, 1)                                                                                  HOURS        -- для проверки
                            ,COALESCE(ROUND(po.THICKNESS * po.WIDTH / 1000000 * 7.85 * 60 * gp.PLAN_SP * idles.HOURS, 1), 0)          IDLE_WEIGHT
                            --,COALESCE(ROUND(po.THICKNESS * po.WIDTH / 1000000 * 7.85 * 60 * gp.PLAN_SP * 24*5, 1), 0)               PLAN_WEIGHT  -- для проверки
                            ,downtime.WEIGHT                                                                                          DOWNTIME_WEIGHT
                          FROM (
                            SELECT -- 1. Генерим дни в заданном интервале (на случай если не будет производства в эти дни)
                              TO_DATE(:bDate,'YYYY-MM-DD') + LEVEL - 1     SHIFT
                            FROM DUAL
                            CONNECT BY LEVEL <= (TO_DATE(:eDate,'YYYY-MM-DD') - TO_DATE(:bDate,'YYYY-MM-DD') + 1)
                          ) days

                          LEFT OUTER JOIN (
                            SELECT -- 4. Группируем, упорядочивая по количеству плавок каждой марки и берем данные оттуда, где количество плавок макс.
                              STOP_DATE                                                 SHIFT
                              ,MAX(cnt) KEEP (DENSE_RANK LAST ORDER BY cnt)             cnt   
                              ,MAX(REPORT_COUNTER) KEEP (DENSE_RANK LAST ORDER BY cnt)  REPORT_COUNTER
                              ,MAX(PRACTICE_ID) KEEP (DENSE_RANK LAST ORDER BY cnt)     PRACTICE_ID
                              ,MAX(STEEL_GRADE_ID) KEEP (DENSE_RANK LAST ORDER BY cnt)  STEEL_GRADE_ID
                            FROM ( 
                              SELECT -- 3. Группируем плавки по марке, практике и дате
                                STOP_DATE
                                ,STEEL_GRADE_ID
                                ,PRACTICE_ID
                                ,MIN(REPORT_COUNTER) REPORT_COUNTER
                                ,COUNT(*) cnt
                              FROM (
                                SELECT -- 2. Выбираем из REPORTS все плавки за требуемый интервал
                                  STEEL_GRADE_ID
                                  ,PRACTICE_ID
                                  ,TRUNC(STOP_DATE + INTERVAL '4' hour + INTERVAL '30' minute, 'DDD')  STOP_DATE
                                  ,REPORT_COUNTER
                                FROM {schema}.REPORTS
                                WHERE 
                                  STOP_DATE + INTERVAL '4' HOUR + INTERVAL '30' MINUTE BETWEEN TO_DATE(:bDate,'YYYY-MM-DD') AND TO_DATE(:eDate,'YYYY-MM-DD')+1
                              )
                              GROUP BY STOP_DATE, STEEL_GRADE_ID, PRACTICE_ID
                            )
                            GROUP BY STOP_DATE
                          ) stpl ON days.SHIFT = stpl.SHIFT

                          -- 5. Подключаем PRODUCT_ORDERS чтобы получить оттуда сечение
                          LEFT OUTER JOIN {schema}.REP_CCM_PRODUCT_ORDERS po ON stpl.REPORT_COUNTER = po.REPORT_COUNTER

                          -- 6. Подключаем GRADE_GROUP чтобы затем соединиться через марку с GRADE_GROUP_PROFILES
                          JOIN {schema}.REP_CCM_GRADE_GROUP gg ON TRIM( UPPER ((  
                                                                    SELECT CASE -- выборка марки из эталонной таблицы до первой скобки
                                                                        WHEN INSTR(gg.STEEL_GRADE_ID, '(') > 0 THEN SUBSTR(gg.STEEL_GRADE_ID, 1, INSTR(gg.STEEL_GRADE_ID, '(') -2)
                                                                        ELSE gg.STEEL_GRADE_ID
                                                                      END
                                                                    FROM DUAL
                                                                ))) = TRIM( UPPER (( 
                                                                    SELECT CASE -- выборка марки из таблицы REPORTS до первой скобки
                                                                        WHEN INSTR(stpl.STEEL_GRADE_ID, '(') > 0 THEN SUBSTR(stpl.STEEL_GRADE_ID, 1, INSTR(stpl.STEEL_GRADE_ID, '(') -2)
                                                                        ELSE stpl.STEEL_GRADE_ID
                                                                      END
                                                                    FROM DUAL
                                                                )))

                          -- 7. Подключаем GRADE_GROUP_PROFILES чтобы вытащить оттуда плановую скорость
                          JOIN {schema}.REP_CCM_GRADE_GROUP_PROFILES gp ON gp.GRADE_GROUP = gg.GRADE_GROUP AND gp.PROFILE_ID = po.PROFILE_ID

                          -- 8. Подключаем посчитанные часы простоев чтобы по ним посчитать итоговый вес
                          LEFT OUTER JOIN (
                            SELECT  -- 8.3 Суммируем часы простоев по всем ручьям кроме общих по машине
                              SHIFT
                              ,SUM(HOURS) HOURS
                            FROM (
                              SELECT  -- 8.2 Если начало простоя лежит за началом суток выборки, то считаем от начала суток выборки и аналогично с концом суток
                                CASE WHEN DELAY_STOP_TIME > STOP_POINT THEN DELAY_START_SHIFT ELSE DELAY_STOP_SHIFT END            SHIFT
                                ,(
                                  (CASE WHEN DELAY_STOP_TIME > STOP_POINT THEN STOP_POINT ELSE DELAY_STOP_TIME END) 
                                  - 
                                  (CASE WHEN DELAY_START_TIME < START_POINT THEN START_POINT ELSE DELAY_START_TIME END) 
                                )*24                                                                                               HOURS
                                ,DELAY_START_TIME -- тут это для проверки
                                ,DELAY_STOP_TIME  -- тут это для проверки
                              FROM (
                                SELECT   -- 8.2 К их датам добавляем границы интервала чтобы не перевалить через них
                                  IDLE_START + INTERVAL '4' HOUR + INTERVAL '30' MINUTE                                            DELAY_START_TIME 
                                  ,COALESCE(IDLE_END, SYSDATE) + INTERVAL '4' HOUR + INTERVAL '30' MINUTE                          DELAY_STOP_TIME
                                  ,TO_DATE(:bDate,'YYYY-MM-DD') - INTERVAL '4' HOUR - INTERVAL '30' MINUTE                         START_POINT
                                  ,TO_DATE(:eDate,'YYYY-MM-DD') + INTERVAL '19' HOUR + INTERVAL '30' MINUTE                        STOP_POINT
                                  ,TRUNC( IDLE_START + INTERVAL '4' HOUR + INTERVAL '30' MINUTE, 'DDD' )                           DELAY_START_SHIFT
                                  ,TRUNC( COALESCE(IDLE_END, SYSDATE) + INTERVAL '4' HOUR + INTERVAL '30' MINUTE, 'DDD' )          DELAY_STOP_SHIFT
                                FROM {schema}.REP_CCM_IDLES
                                WHERE ( -- 8.1 Берем те простои, у которых конечная и начальная даты попадают в требуемый интервал
                                  IDLE_START BETWEEN TO_DATE(:bDate,'YYYY-MM-DD') + INTERVAL '4' HOUR + INTERVAL '30' MINUTE AND TO_DATE(:eDate,'YYYY-MM-DD')+1 - INTERVAL '4' HOUR - INTERVAL '30' MINUTE
                                  OR 
                                  COALESCE(IDLE_END, SYSDATE) BETWEEN TO_DATE(:bDate,'YYYY-MM-DD') + INTERVAL '4' HOUR + INTERVAL '30' MINUTE AND TO_DATE(:eDate,'YYYY-MM-DD')+1 - INTERVAL '4' HOUR - INTERVAL '30' MINUTE 
                                ) -- 8.1 и исключаем простои по всей машине
                                AND STRAND_NO <> 0
                              )
                            )
                            GROUP BY SHIFT
                            ORDER BY SHIFT
                          ) idles ON stpl.SHIFT = idles.SHIFT

                          -- 9. Добавляем информацию по снижению производительности
                          LEFT OUTER JOIN (
                            SELECT
                              SHIFT
                              ,CASE WHEN DIFF < 0 THEN ABS(DIFF) ELSE 0 END     WEIGHT
                            FROM (
                              SELECT
                                SHIFT
                                ,ROUND(SUM(SUM_WEIGHT),1)                       SUM_WEIGHT
                                ,ROUND(SUM(PLAN_WEIGHT),1)                      PLAN_WEIGHT
                                ,ROUND(SUM(SUM_WEIGHT) - SUM(PLAN_WEIGHT),1)    DIFF
                                ,ROUND(SUM(RUNNING_HOURS),1)                    RUNNING_HOURS
                              FROM (
                                SELECT  -- 9.2 Суммируем производительности
                                  HEAT_ID
                                  ,MAX(RUNNING_HOURS)                       RUNNING_HOURS
                                  ,SUM(PERFORMANCE * RUNNING_HOURS)         SUM_WEIGHT
                                  ,MAX(PLAN_PERFORMANCE * RUNNING_HOURS)    PLAN_WEIGHT
                                  ,MAX(TRUNC(END_POINT,'DDD'))              SHIFT
                                FROM (
                                  SELECT  -- 9.1 Выбираем все записи за требуемый интервал
                                    HEAT_ID
                                    ,PERFORMANCE
                                    ,PLAN_PERFORMANCE * 0.98                                                                    PLAN_PERFORMANCE
                                    ,TO_DATE(DE || TE,'DD.MM.YYYYHH24MISS') + INTERVAL '4' HOUR + INTERVAL '30' MINUTE          END_POINT
                                    ,SUBSTR(RUNNING_TIME,1,2) + SUBSTR(RUNNING_TIME,3,2)/60 + SUBSTR(RUNNING_TIME,5,2)/3600     RUNNING_HOURS
                                  FROM REP_CCM_CASTING_SPEED_VIEW
                                  WHERE TO_DATE(DE || TE,'DD.MM.YYYYHH24MISS') + INTERVAL '4' HOUR + INTERVAL '30' MINUTE
                                    BETWEEN TO_DATE(:bDate,'YYYY-MM-DD') AND TO_DATE(:eDate,'YYYY-MM-DD')+1
                                )
                                GROUP BY HEAT_ID
                              )
                              GROUP BY SHIFT
                            )
                          ) downtime ON downtime.SHIFT = stpl.SHIFT

                          ORDER BY stpl.SHIFT";

          return await db.QueryAsync(stmt, new { bDate, eDate });
        }
      }

      throw new Exception($"[CCMRepository]: I cannot handle CCM {ccmNo}");
    }
  }
}