-- ============================================
-- 回滾：刪除數學領域學習表現資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除數學學習表現表
DROP TABLE IF EXISTS math_learning_performances;

SELECT '數學學習表現資料表已刪除' AS message;

