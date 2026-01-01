-- ============================================
-- 在 ideas 表中新增 activity_id 欄位
-- 用於關聯想法與共備活動
-- ============================================

USE teacher_collaboration_system;

-- 檢查欄位是否已存在，如果不存在則新增
-- 注意：MySQL 不支援 IF NOT EXISTS 在 ALTER TABLE ADD COLUMN，需要先檢查

-- 新增 activity_id 欄位（可選，允許 NULL）
ALTER TABLE ideas 
ADD COLUMN activity_id VARCHAR(36) NULL COMMENT '關聯的共備活動ID' AFTER community_id;

-- 新增外鍵約束（如果活動被刪除，想法不會被刪除，只是 activity_id 會保持原值）
ALTER TABLE ideas 
ADD CONSTRAINT fk_ideas_activity 
FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL;

-- 新增索引以提升查詢效能
ALTER TABLE ideas 
ADD INDEX idx_activity (activity_id);

