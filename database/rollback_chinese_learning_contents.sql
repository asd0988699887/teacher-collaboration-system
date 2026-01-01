-- ============================================
-- 回滾：刪除國文領域學習內容資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除國文學習內容表
DROP TABLE IF EXISTS chinese_learning_contents;

SELECT '國文學習內容資料表已刪除' AS message;

