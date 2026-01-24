-- 創建英文學習表現資料表（國中/高中）
-- 兩層結構：大分類 → 學習表現

CREATE TABLE IF NOT EXISTS english_middle_high_performances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  main_category INT NOT NULL COMMENT '大分類編號（1=語言能力（聽）, 2=語言能力（說）, 3=語言能力（讀）, 4=語言能力（寫）, 5=語言能力（聽說讀寫綜合應用能力）, 6=學習興趣與態度, 7=學習方法與策略, 8=文化理解, 9=邏輯思考、判斷與創造力）',
  main_category_name VARCHAR(100) NOT NULL COMMENT '大分類名稱',
  code VARCHAR(20) NOT NULL COMMENT '學習表現代碼（如 1-IV-1, 2-V-3）',
  description TEXT NOT NULL COMMENT '學習表現描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_main_category (main_category),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='英文學習表現（國中/高中）';

