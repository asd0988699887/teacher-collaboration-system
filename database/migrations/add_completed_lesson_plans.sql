-- 已完成教案快照（同一活動內可累積多份，供下一單元共備時回顧）
CREATE TABLE IF NOT EXISTS completed_lesson_plans (
    id VARCHAR(36) PRIMARY KEY,
    activity_id VARCHAR(36) NOT NULL COMMENT '共備活動 ID',
    title VARCHAR(255) COMMENT '封存時教案標題',
    lesson_plan_data JSON NOT NULL COMMENT '教案完整快照',
    completed_by VARCHAR(36) NOT NULL COMMENT '封存者 ID',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '封存時間',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序（愈大愈新）',
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity (activity_id),
    INDEX idx_activity_sort (activity_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='已完成教案表';
