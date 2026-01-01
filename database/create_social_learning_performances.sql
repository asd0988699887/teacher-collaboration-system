-- ============================================
-- 創建社會領域學習表現資料表
-- ============================================
USE teacher_collaboration_system;

-- 創建社會學習表現表
CREATE TABLE IF NOT EXISTS social_learning_performances (
  id VARCHAR(36) PRIMARY KEY COMMENT '唯一識別碼',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '完整編碼 (例如: 1a-II-1)',
  dimension_item VARCHAR(10) NOT NULL COMMENT '構面項目代碼 (1a, 1b, 1c, 2a, 2b, 2c, 3a, 3b, 3c, 3d)',
  dimension_item_name VARCHAR(100) NOT NULL COMMENT '構面項目名稱',
  stage VARCHAR(5) NOT NULL COMMENT '學習階段 (II/III)',
  stage_name VARCHAR(50) NOT NULL COMMENT '階段名稱',
  serial INT NOT NULL COMMENT '流水號',
  description TEXT NOT NULL COMMENT '學習表現內容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  INDEX idx_dimension_item (dimension_item) COMMENT '構面項目索引',
  INDEX idx_stage (stage) COMMENT '階段索引',
  INDEX idx_dimension_item_stage (dimension_item, stage) COMMENT '構面項目階段組合索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社會領域學習表現';

SELECT '社會學習表現資料表創建成功' AS message;

