-- ============================================
-- 添加 school_level 欄位到 lesson_plans 表
-- ============================================

USE teacher_collaboration_system;

ALTER TABLE lesson_plans 
ADD COLUMN school_level VARCHAR(50) COMMENT '學段（國小、國中、高中（高職））' 
AFTER unit_name;



