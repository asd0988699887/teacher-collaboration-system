-- 創建國文學習表現資料表（國中/高中）
-- 兩層結構：大分類 → 學習表現

CREATE TABLE IF NOT EXISTS chinese_middle_high_performances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  main_category INT NOT NULL COMMENT '大分類編號（1=聆聽, 2=口語表達, 4=識字與寫字, 5=閱讀, 6=寫作）',
  main_category_name VARCHAR(50) NOT NULL COMMENT '大分類名稱',
  code VARCHAR(20) NOT NULL COMMENT '學習表現代碼（如 1-IV-1, 2-V-3）',
  description TEXT NOT NULL COMMENT '學習表現描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_main_category (main_category),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='國文學習表現（國中/高中）';

