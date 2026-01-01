-- ============================================
-- 回滾：移除 ideas 表中的 activity_id 欄位
-- ============================================

USE teacher_collaboration_system;

-- 刪除外鍵約束
ALTER TABLE ideas 
DROP FOREIGN KEY IF EXISTS fk_ideas_activity;

-- 刪除索引
ALTER TABLE ideas 
DROP INDEX IF EXISTS idx_activity;

-- 刪除欄位
ALTER TABLE ideas 
DROP COLUMN IF EXISTS activity_id;

