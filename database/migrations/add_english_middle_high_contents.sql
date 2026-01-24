-- 創建英文學習內容資料表（國中/高中）
-- 結構：主分類（A/B/C/D）→ 子分類（a/b/c/d/e，僅 A 主題有）→ 學習內容

CREATE TABLE IF NOT EXISTS english_middle_high_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  main_category_code VARCHAR(10) NOT NULL COMMENT '主分類代碼（A=語言知識, B=溝通功能, C=文化與習俗, D=思考能力）',
  main_category_name VARCHAR(50) NOT NULL COMMENT '主分類名稱',
  sub_category_code VARCHAR(10) DEFAULT NULL COMMENT '子分類代碼（a/b/c/d/e，僅 A 主題有，B/C/D 為 NULL）',
  sub_category_name VARCHAR(50) DEFAULT NULL COMMENT '子分類名稱（字母/語音/字詞/句構/篇章，僅 A 主題有，B/C/D 為 NULL）',
  code VARCHAR(20) NOT NULL COMMENT '學習內容代碼（如 Aa-IV-1, B-IV-1）',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_main_category_code (main_category_code),
  INDEX idx_sub_category_code (sub_category_code),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='英文學習內容（國中/高中）';

