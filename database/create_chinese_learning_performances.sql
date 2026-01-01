-- ============================================
-- 創建國文領域學習表現資料表
-- ============================================
USE teacher_collaboration_system;

-- 創建國文學習表現表
CREATE TABLE IF NOT EXISTS chinese_learning_performances (
  id VARCHAR(36) PRIMARY KEY COMMENT '唯一識別碼',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '完整編碼 (例如: 1-I-1)',
  category INT NOT NULL COMMENT '類別 (1-6: 聆聽/口語表達/標音符號與運用/識字與寫字/閱讀/寫作)',
  category_name VARCHAR(50) NOT NULL COMMENT '類別名稱',
  stage VARCHAR(5) NOT NULL COMMENT '學習階段 (I/II/III)',
  stage_name VARCHAR(50) NOT NULL COMMENT '階段名稱',
  serial INT NOT NULL COMMENT '流水號',
  description TEXT NOT NULL COMMENT '學習表現內容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  INDEX idx_category (category) COMMENT '類別索引',
  INDEX idx_stage (stage) COMMENT '階段索引',
  INDEX idx_category_stage (category, stage) COMMENT '類別階段組合索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='國文領域學習表現';

SELECT '國文學習表現資料表創建成功' AS message;

