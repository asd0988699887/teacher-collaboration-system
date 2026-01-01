-- ============================================
-- 創建英文領域學習內容資料表
-- ============================================
USE teacher_collaboration_system;

-- 創建英文學習內容表
CREATE TABLE IF NOT EXISTS english_learning_contents (
  id VARCHAR(36) PRIMARY KEY COMMENT '唯一識別碼',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '完整編碼 (例如: Aa-II-1)',
  topic VARCHAR(10) NOT NULL COMMENT '主題項目代碼 (Aa, Ab, Ac, Ad, Ae, B, C, D)',
  topic_name VARCHAR(100) NOT NULL COMMENT '主題項目名稱',
  stage VARCHAR(5) NOT NULL COMMENT '學習階段 (I/II/III)',
  stage_name VARCHAR(50) NOT NULL COMMENT '階段名稱',
  serial INT NOT NULL COMMENT '流水號',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  INDEX idx_topic (topic) COMMENT '主題索引',
  INDEX idx_stage (stage) COMMENT '階段索引',
  INDEX idx_topic_stage (topic, stage) COMMENT '主題階段組合索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='英文領域學習內容';

SELECT '英文學習內容資料表創建成功' AS message;

