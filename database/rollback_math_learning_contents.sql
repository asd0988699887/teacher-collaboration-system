-- ============================================
-- 回滾：刪除數學領域學習內容資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除數學學習內容表
DROP TABLE IF EXISTS math_learning_contents;

SELECT '數學學習內容資料表已刪除' AS message;

