-- 創建自然科學習內容資料表（國中/高中）
-- 國中：三層結構（主題 → 次主題 → 學習內容）
-- 高中：四層結構（科目 → 主題 → 次主題 → 學習內容）

CREATE TABLE IF NOT EXISTS natural_middle_high_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  subject_code VARCHAR(10) NULL COMMENT '科目代碼（僅高中有：B=生物, P=物理, C=化學, E=地球科學）',
  subject_name VARCHAR(50) NULL COMMENT '科目名稱（僅高中有：生物、物理、化學、地球科學）',
  theme_code VARCHAR(10) NOT NULL COMMENT '主題代碼（A-N，國中）或主題代碼（D, G, M等，高中）',
  theme_name VARCHAR(100) NOT NULL COMMENT '主題名稱（例如：物質的組成與特性、生物體的構造與功能）',
  sub_theme_code VARCHAR(10) NOT NULL COMMENT '次主題代碼（Aa, Ab等）',
  sub_theme_name VARCHAR(100) NOT NULL COMMENT '次主題名稱（例如：物質組成與元素的週期性、細胞的構造與功能）',
  code VARCHAR(20) NOT NULL COMMENT '學習內容代碼（例如：Aa-IV-1, BDa-Vc-1）',
  description TEXT NOT NULL COMMENT '學習內容描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_subject_code (subject_code),
  INDEX idx_theme_code (theme_code),
  INDEX idx_sub_theme_code (sub_theme_code),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自然科學習內容（國中/高中）';

