-- ПОТЕРИ ПО СНИЖЕНИЮ ПРОИЗВОДИТЕЛЬНОСТИ МНЛЗ-5
-- не понятно, почему Яша берет только максимальное число простоев. Там есть и по другим маркам тоже
WITH p AS (
  SELECT
    TO_DATE(:bDate,'YYYY-MM-DD')                                    startT
    ,TO_DATE(:eDate,'YYYY-MM-DD') + interval '1' day                stopT
    ,INTERVAL '4' hour + INTERVAL '30' minute                       shiftOffset
    ,TO_DATE('01-01-1970', 'DD-MM-YYYY')                            noDate
  FROM dual
),
fullReport AS ( -- выбираем из REPORTS
  SELECT 
    steel_grade_id,
    practice_id,
    TRUNC(STOP_DATE + p.shiftOffset, 'DDD') as STOP_DATE,
    report_counter
  FROM L2PRD.REPORTS, p
  WHERE 
    STOP_DATE + p.shiftOffset >= p.startT      -- конечная точка + 4:30 >= начальной даты, т.е. ищутся записи, закончившиеся в начальную дату до 19:30 (с предыдущей смены)
    and STOP_DATE + p.shiftOffset < p.stopT    -- конечная точка + 4:30 < конечной даты, т.е. ищутся записи, закончившиеся в конечную дату до 19:30 (те которые только к конечной смене относятся)
),
innr AS ( -- схлапываем и считаем количество и упорядочиваем от большего к меньшему
  SELECT 
    STOP_DATE,
    STEEL_GRADE_ID,
    MIN(REPORT_COUNTER)   REPORT_COUNTER,
    COUNT(*)              CNT
  FROM fullReport
  GROUP BY STOP_DATE, STEEL_GRADE_ID
  ORDER BY CNT DESC
),
outtr AS ( -- пиздец, Яша.. берем строку, где количество CNT максимальное
  SELECT * FROM innr
  --WHERE ROWNUM = 1
),
rds AS (  -- берем все простои за указанный период + смены к которым они относятся (rawDelays)
  SELECT 
    delay_start_time  -- ниже NULLIF сравнивает. Если стоп еще не указан, то вернет NULL
    ,COALESCE(NULLIF(delay_stop_time, p.noDate), SYSDATE)                delay_stop_time
    ,delay_start_time + shiftOffset                                      delay_start_shift -- точка с учетом сдвига 4:30
  FROM L2PRD.REP_DELAYS, p
  WHERE 
    (DELAY_START_TIME + shiftOffset >= p.startT AND DELAY_START_TIME + shiftOffset < p.stopT)
    OR (DELAY_STOP_TIME + shiftOffset >= p.startT AND DELAY_STOP_TIME + shiftOffset < p.stopT)
),
delays AS ( -- считаем разницу временных промежутков
  SELECT
    TRUNC(rds.delay_start_shift, 'DDD')                                   delayDate
    ,SUM((rds.delay_stop_time - rds.delay_start_time) * 24 * 60 * 60)     count
  FROM rds
  GROUP BY TRUNC(rds.delay_start_shift, 'DDD')
)
SELECT -- а на 5 Яша count умножал т.к. ручьев 5, но в таблице простоев не пишется номер ручья
  outtr.STOP_DATE                             day
  ,outtr.steel_grade_id                       mark
  ,o.PROFILE_ID                               profile
  ,o.WIDTH                                    width
  ,o.THICKNESS                                thickness
  ,d.COUNT                                    count
FROM outtr
JOIN L2PRD.REP_CCM_PRODUCT_ORDERS o ON outtr.REPORT_COUNTER = o.REPORT_COUNTER  -- подключаем заказы чтобы узнать размеры и профиль
JOIN delays d ON d.DELAYDATE = outtr.STOP_DATE  -- подключаем рассчитанную сумму простоев