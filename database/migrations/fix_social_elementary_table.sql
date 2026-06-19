-- ============================================
-- 修復社會科國小表（當 social_learning_contents 被國中/高中 schema 覆蓋時）
-- 執行前請先跑 add_social_middle_high_contents.sql 保留國中/高中資料
-- ============================================
USE teacher_collaboration_system;

SET @has_topic_item := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'social_learning_contents'
    AND COLUMN_NAME = 'topic_item'
);

SELECT IF(
  @has_topic_item > 0,
  'social_learning_contents 已是國小 schema，略過重建',
  '將重建 social_learning_contents 為國小 schema'
) AS status;

DROP TABLE IF EXISTS social_learning_contents_backup_for_elem;

SET @sql := IF(
  @has_topic_item = 0,
  'DROP TABLE IF EXISTS social_learning_contents',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS social_learning_contents (
  id VARCHAR(36) PRIMARY KEY COMMENT '唯一識別碼',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '完整編碼 (例如: Aa-II-1)',
  topic_item VARCHAR(10) NOT NULL COMMENT '主題軸項目代碼',
  topic_item_name VARCHAR(100) NOT NULL COMMENT '主題軸項目名稱',
  stage VARCHAR(5) NOT NULL COMMENT '學習階段 (II/III)',
  stage_name VARCHAR(50) NOT NULL COMMENT '階段名稱',
  serial INT NOT NULL COMMENT '流水號',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  INDEX idx_topic_item (topic_item),
  INDEX idx_stage (stage),
  INDEX idx_topic_item_stage (topic_item, stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社會領域學習內容（國小）';

SELECT '國小表已建立；請執行 database/seed_social_learning_contents.sql 匯入資料' AS next_step;
