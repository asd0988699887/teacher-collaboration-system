-- 創建數學學習內容資料表（國中/高中）
-- 兩層結構：年級 → 學習內容

CREATE TABLE IF NOT EXISTS math_middle_high_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  grade VARCHAR(20) NOT NULL COMMENT '年級（7年級、8年級、9年級、10年級、11年級A類、11年級B類、12年級甲類、12年級乙類）',
  code VARCHAR(20) NOT NULL COMMENT '學習內容編碼（如 N-7-1）',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_grade (grade),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='數學學習內容（國中/高中）';

