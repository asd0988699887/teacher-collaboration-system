-- ============================================
-- 教案編輯相關資料表
-- 補充 schema.sql 中缺少的教案資料結構
-- ============================================

USE teacher_collaboration_system;

-- ============================================
-- 1. 教案主表
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plans (
    id VARCHAR(36) PRIMARY KEY,
    activity_id VARCHAR(36) NOT NULL COMMENT '活動ID',
    lesson_plan_title VARCHAR(255) COMMENT '教案標題',
    course_domain VARCHAR(50) COMMENT '課程領域（國文、數學、英文、自然、社會）',
    designer VARCHAR(255) COMMENT '設計者',
    unit_name VARCHAR(255) COMMENT '單元名稱',
    implementation_grade VARCHAR(50) COMMENT '實施年級',
    teaching_time_lessons INT COMMENT '授課節數',
    teaching_time_minutes INT COMMENT '授課分鐘數',
    material_source TEXT COMMENT '教材來源',
    teaching_equipment TEXT COMMENT '教學設備/資源',
    learning_objectives TEXT COMMENT '學習目標',
    assessment_tools TEXT COMMENT '評量工具',
    `references` TEXT COMMENT '參考資料',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_activity (activity_id),
    UNIQUE KEY unique_activity_lesson_plan (activity_id) COMMENT '每個活動對應一個教案'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教案主表';

-- ============================================
-- 2. 教案核心素養表
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plan_core_competencies (
    id VARCHAR(36) PRIMARY KEY,
    lesson_plan_id VARCHAR(36) NOT NULL COMMENT '教案ID',
    content TEXT NOT NULL COMMENT '核心素養內容',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id) ON DELETE CASCADE,
    INDEX idx_lesson_plan (lesson_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教案核心素養表';

-- ============================================
-- 3. 教案學習表現表
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plan_learning_performances (
    id VARCHAR(36) PRIMARY KEY,
    lesson_plan_id VARCHAR(36) NOT NULL COMMENT '教案ID',
    code VARCHAR(50) NOT NULL COMMENT '學習表現代碼',
    description TEXT NOT NULL COMMENT '學習表現描述',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id) ON DELETE CASCADE,
    INDEX idx_lesson_plan (lesson_plan_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教案學習表現表';

-- ============================================
-- 4. 教案學習內容表
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plan_learning_contents (
    id VARCHAR(36) PRIMARY KEY,
    lesson_plan_id VARCHAR(36) NOT NULL COMMENT '教案ID',
    code VARCHAR(50) NOT NULL COMMENT '學習內容代碼',
    description TEXT NOT NULL COMMENT '學習內容描述',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id) ON DELETE CASCADE,
    INDEX idx_lesson_plan (lesson_plan_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教案學習內容表';

-- ============================================
-- 5. 教案活動與評量設計表（多筆資料）
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plan_activity_rows (
    id VARCHAR(36) PRIMARY KEY,
    lesson_plan_id VARCHAR(36) NOT NULL COMMENT '教案ID',
    teaching_content TEXT COMMENT '教學內容及實施方式',
    teaching_time VARCHAR(50) COMMENT '教學時間',
    teaching_resources TEXT COMMENT '教學資源',
    assessment_methods TEXT COMMENT '學習評量方式',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id) ON DELETE CASCADE,
    INDEX idx_lesson_plan (lesson_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教案活動與評量設計表';

-- ============================================
-- 6. 雙向細目表 - 學習表現勾選狀態
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plan_specification_performances (
    id VARCHAR(36) PRIMARY KEY,
    lesson_plan_id VARCHAR(36) NOT NULL COMMENT '教案ID',
    performance_id VARCHAR(36) NOT NULL COMMENT '學習表現ID',
    activity_row_id VARCHAR(36) NOT NULL COMMENT '活動行ID',
    is_checked BOOLEAN DEFAULT FALSE COMMENT '是否勾選',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (performance_id) REFERENCES lesson_plan_learning_performances(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_row_id) REFERENCES lesson_plan_activity_rows(id) ON DELETE CASCADE,
    UNIQUE KEY unique_performance_activity (performance_id, activity_row_id),
    INDEX idx_lesson_plan (lesson_plan_id),
    INDEX idx_performance (performance_id),
    INDEX idx_activity_row (activity_row_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='雙向細目表-學習表現勾選狀態';

-- ============================================
-- 7. 雙向細目表 - 學習內容勾選狀態
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_plan_specification_contents (
    id VARCHAR(36) PRIMARY KEY,
    lesson_plan_id VARCHAR(36) NOT NULL COMMENT '教案ID',
    content_id VARCHAR(36) NOT NULL COMMENT '學習內容ID',
    activity_row_id VARCHAR(36) NOT NULL COMMENT '活動行ID',
    is_checked BOOLEAN DEFAULT FALSE COMMENT '是否勾選',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (lesson_plan_id) REFERENCES lesson_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES lesson_plan_learning_contents(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_row_id) REFERENCES lesson_plan_activity_rows(id) ON DELETE CASCADE,
    UNIQUE KEY unique_content_activity (content_id, activity_row_id),
    INDEX idx_lesson_plan (lesson_plan_id),
    INDEX idx_content (content_id),
    INDEX idx_activity_row (activity_row_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='雙向細目表-學習內容勾選狀態';

-- ============================================
-- 視圖：教案完整資訊（包含活動資訊）
-- ============================================
CREATE OR REPLACE VIEW lesson_plans_detail AS
SELECT 
    lp.id,
    lp.activity_id,
    lp.lesson_plan_title,
    lp.course_domain,
    lp.designer,
    lp.unit_name,
    lp.implementation_grade,
    lp.teaching_time_lessons,
    lp.teaching_time_minutes,
    lp.material_source,
    lp.teaching_equipment,
    lp.learning_objectives,
    lp.assessment_tools,
    lp.`references`,
    lp.created_at,
    lp.updated_at,
    a.name AS activity_name,
    a.community_id,
    a.creator_id
FROM lesson_plans lp
INNER JOIN activities a ON lp.activity_id = a.id;

-- ============================================
-- 注意事項
-- ============================================
-- 1. 每個活動（activity）對應一個教案（lesson_plan）
-- 2. 教案可以有多筆核心素養、學習表現、學習內容
-- 3. 教案可以有多筆活動與評量設計（activity_rows）
-- 4. 雙向細目表的勾選狀態儲存在 specification_performances 和 specification_contents 表中
-- 5. 版本管理仍使用 activity_versions 表，但可以參考 lesson_plans 的資料

