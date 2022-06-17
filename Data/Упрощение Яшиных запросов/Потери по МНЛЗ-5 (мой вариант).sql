-- ПОТЕРИ ПО СНИЖЕНИЮ ПРОИЗВОДИТЕЛЬНОСТИ МНЛЗ-5
WITH p AS (
  SELECT
    TO_DATE(:bDate,'YYYY-MM-DD')                                    startT
    ,TO_DATE(:eDate,'YYYY-MM-DD') + interval '1' day                stopT
    ,(SELECT INTERVAL '4' hour + INTERVAL '30' minute FROM DUAL)    shiftOffset
    ,TO_DATE('01-01-1970', 'DD-MM-YYYY')                            noDate
  FROM dual
),
fullReport AS ( -- выбираем из REPORTS
  SELECT 
    steel_grade_id
    ,START_DATE
    ,STOP_DATE
    ,TRUNC(STOP_DATE + p.shiftOffset, 'DDD') as SHIFT_DATE
    ,report_counter
  FROM L2PRD.REPORTS, p
  WHERE 
    STOP_DATE + p.shiftOffset >= p.startT      -- конечная точка + 4:30 >= начальной даты, т.е. ищутся записи, закончившиеся в начальную дату до 19:30 (с предыдущей смены)
    and STOP_DATE + p.shiftOffset < p.stopT    -- конечная точка + 4:30 < конечной даты, т.е. ищутся записи, закончившиеся в конечную дату до 19:30 (те которые только к конечной смене относятся)
),
orders AS ( -- схлапываем и считаем количество и упорядочиваем от большего к меньшему
  SELECT 
    SHIFT_DATE
    ,MIN(START_DATE)        START_DATE
    ,MAX(STOP_DATE)         STOP_DATE
    ,STEEL_GRADE_ID
    ,MIN(REPORT_COUNTER)    REPORT_COUNTER
  FROM fullReport
  GROUP BY STEEL_GRADE_ID, SHIFT_DATE
),
delays AS (
  SELECT 
    delay_start_time  -- ниже NULLIF сравнивает. Если стоп еще не указан, то вернет NULL
    ,COALESCE(NULLIF(delay_stop_time, p.noDate), SYSDATE)                delay_stop_time
    ,TRUNC(delay_start_time + shiftOffset, 'DDD')                        SHIFT_DATE -- точка с учетом сдвига 4:30
  FROM L2PRD.REP_DELAYS, p
  WHERE 
    (DELAY_START_TIME + shiftOffset >= p.startT AND DELAY_START_TIME + shiftOffset < p.stopT)
    OR (DELAY_STOP_TIME + shiftOffset >= p.startT AND DELAY_STOP_TIME + shiftOffset < p.stopT)
)
SELECT
  o.STEEL_GRADE_ID
  ,ord.PROFILE_ID                                                 profile
  ,ord.WIDTH                                                      width
  ,ord.THICKNESS                                                  thickness
  ,SUM((D.DELAY_STOP_TIME - D.DELAY_START_TIME) * 24 * 60 * 60)   COUNT
FROM orders o
JOIN delays d ON D.DELAY_START_TIME BETWEEN o.START_DATE AND o.STOP_DATE
JOIN L2PRD.REP_CCM_PRODUCT_ORDERS ord ON o.REPORT_COUNTER = ord.REPORT_COUNTER
GROUP BY o.STEEL_GRADE_ID, ord.PROFILE_ID, ord.WIDTH, ord.THICKNESS