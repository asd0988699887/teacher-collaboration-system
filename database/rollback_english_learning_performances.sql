-- ============================================
-- 回滾：刪除英文領域學習表現資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除英文學習表現表
DROP TABLE IF EXISTS english_learning_performances;

SELECT '英文學習表現資料表已刪除' AS message;

