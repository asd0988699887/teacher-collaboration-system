-- ============================================
-- 回滾：刪除英文領域學習內容資料表
-- ============================================
USE teacher_collaboration_system;

-- 刪除英文學習內容表
DROP TABLE IF EXISTS english_learning_contents;

SELECT '英文學習內容資料表已刪除' AS message;

