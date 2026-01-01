-- ============================================
-- 回滾：刪除社會領域學習內容資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除社會學習內容表
DROP TABLE IF EXISTS social_learning_contents;

SELECT '社會學習內容資料表已刪除' AS message;

