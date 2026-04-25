-- 結束共備：標記活動已完成，供「進行中」與歷史列表區分
USE teacher_collaboration_system;

ALTER TABLE activities
ADD COLUMN completed_at DATETIME NULL DEFAULT NULL COMMENT '結束共備時間（NULL 表示進行中）' AFTER updated_at;
