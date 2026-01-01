-- ============================================
-- 回滾：刪除國文領域學習表現資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除國文學習表現表
DROP TABLE IF EXISTS chinese_learning_performances;

SELECT '國文學習表現資料表已刪除' AS message;

