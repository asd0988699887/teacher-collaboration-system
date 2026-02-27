-- 檢查資料庫時間和時區
SELECT NOW() AS `current_time`, @@session.time_zone AS timezone;

-- 檢查資料庫系統時區
SELECT @@global.time_zone AS global_timezone, @@session.time_zone AS session_timezone;



