-- ============================================
-- 創建數學領域學習內容資料表
-- ============================================
USE teacher_collaboration_system;

-- 創建數學學習內容表
CREATE TABLE IF NOT EXISTS math_learning_contents (
  id VARCHAR(36) PRIMARY KEY COMMENT '唯一識別碼',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '完整編碼 (例如: N-1-1)',
  category CHAR(1) NOT NULL COMMENT '主題類別 (N/S/G/R/A/F/D)',
  category_name VARCHAR(50) NOT NULL COMMENT '類別名稱 (數與量/空間與形狀等)',
  grade INT NOT NULL COMMENT '年級階段 (1-6)',
  serial INT NOT NULL COMMENT '流水號',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  INDEX idx_category (category) COMMENT '類別索引',
  INDEX idx_grade (grade) COMMENT '年級索引',
  INDEX idx_category_grade (category, grade) COMMENT '類別年級組合索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='數學領域學習內容';

SELECT '數學學習內容資料表創建成功' AS message;

