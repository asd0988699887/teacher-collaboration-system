-- 創建數學學習表現資料表（國中/高中）
-- 兩層結構：項目 → 學習表現

CREATE TABLE IF NOT EXISTS math_middle_high_performances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  category VARCHAR(10) NOT NULL COMMENT '項目代號（如 n, s, g, a, f, d）',
  category_name VARCHAR(50) NOT NULL COMMENT '項目名稱（如 數與量）',
  code VARCHAR(20) NOT NULL COMMENT '學習表現代碼（如 n-IV-1）',
  description TEXT NOT NULL COMMENT '學習表現描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_category (category),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='數學學習表現（國中/高中）';

