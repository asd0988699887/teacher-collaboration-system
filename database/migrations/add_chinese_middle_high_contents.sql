-- 創建國文學習內容資料表（國中/高中）
-- 兩層結構：主分類代碼 → 學習內容項目

CREATE TABLE IF NOT EXISTS chinese_middle_high_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  main_category_code VARCHAR(10) NOT NULL COMMENT '主分類代碼（Ab, Ac, Ad, Ba, Bb, Bc, Bd, Be, Ca, Cb, Cc）',
  main_category_name VARCHAR(50) NOT NULL COMMENT '主分類名稱',
  code VARCHAR(20) NOT NULL COMMENT '學習內容代碼（如 Ab-IV-1, Ac-V-2）',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_main_category_code (main_category_code),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='國文學習內容（國中/高中）';

