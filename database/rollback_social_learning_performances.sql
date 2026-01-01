-- ============================================
-- 回滾：刪除社會領域學習表現資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除社會學習表現表
DROP TABLE IF EXISTS social_learning_performances;

SELECT '社會學習表現資料表已刪除' AS message;

