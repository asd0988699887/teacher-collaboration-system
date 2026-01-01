-- ============================================
-- 通知系統資料表
-- ============================================

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    user_id VARCHAR(36) NOT NULL COMMENT '接收通知的使用者',
    actor_id VARCHAR(36) NOT NULL COMMENT '執行操作的使用者',
    type ENUM('file', 'task', 'idea', 'lesson_plan') NOT NULL COMMENT '通知類型',
    action ENUM('create', 'update', 'reply') NOT NULL COMMENT '操作類型',
    content TEXT NOT NULL COMMENT '通知內容',
    related_id VARCHAR(36) COMMENT '相關項目ID',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已讀',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_community (community_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 自動清理90天前的舊通知（可選）
-- 可以設定定期任務執行：DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

