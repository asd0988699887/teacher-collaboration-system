-- ============================================
-- 新增學段欄位至教案主表
-- 執行時間: 2026-01-21
-- ============================================

USE teacher_collaboration_system;

-- 在 lesson_plans 表中新增 school_level 欄位
ALTER TABLE lesson_plans
ADD COLUMN school_level VARCHAR(20) COMMENT '學段（國小、國中、高中（高職））' 
AFTER unit_name;

-- 更新視圖以包含新欄位
CREATE OR REPLACE VIEW lesson_plans_detail AS
SELECT 
    lp.id,
    lp.activity_id,
    lp.lesson_plan_title,
    lp.course_domain,
    lp.designer,
    lp.unit_name,
    lp.school_level,
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
-- 說明
-- ============================================
-- 1. school_level 欄位用於儲存學段資訊
--    可能的值: '國小', '國中', '高中（高職）'
-- 2. 此欄位與 implementation_grade 欄位配合使用
--    例如: school_level='國小', implementation_grade='3' 表示「國小三年級」
-- 3. 更新了 lesson_plans_detail 視圖以包含新欄位

