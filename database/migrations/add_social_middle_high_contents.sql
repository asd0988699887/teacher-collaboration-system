-- ============================================
-- 社會科國中/高中學習內容（與國小 social_learning_contents 分表）
-- ============================================
USE teacher_collaboration_system;

CREATE TABLE IF NOT EXISTS social_middle_high_contents (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT '條目代碼（如：歷Ba-IV-1）',
    stage VARCHAR(5) NOT NULL COMMENT '學段（IV=國中，V=高中）',
    subject VARCHAR(10) NOT NULL COMMENT '科目（歷、地、公）',
    theme VARCHAR(5) NOT NULL COMMENT '主題代碼（A, B, C...）',
    theme_name VARCHAR(100) NOT NULL COMMENT '主題名稱',
    category VARCHAR(5) DEFAULT NULL COMMENT '項目代碼（a, b, c...，可為空）',
    category_name VARCHAR(100) DEFAULT NULL COMMENT '項目名稱（可為空）',
    description TEXT NOT NULL COMMENT '條目描述',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stage (stage),
    INDEX idx_subject (subject),
    INDEX idx_theme (theme),
    INDEX idx_category (category),
    INDEX idx_stage_subject (stage, subject),
    INDEX idx_theme_category (theme, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社會科學習內容（國中+高中）';

-- 若舊版 migration 把國中/高中資料建在 social_learning_contents（含 subject 欄），搬移到新表
SET @has_subject_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'social_learning_contents'
    AND COLUMN_NAME = 'subject'
);

SET @sql := IF(
  @has_subject_col > 0,
  'INSERT IGNORE INTO social_middle_high_contents
     (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order, created_at)
   SELECT id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order, created_at
   FROM social_learning_contents',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'social_middle_high_contents 就緒' AS message;
