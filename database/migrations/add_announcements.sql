-- 公告欄表
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    content TEXT NOT NULL COMMENT '公告內容',
    created_by VARCHAR(36) COMMENT '發布人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '發布時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_community (community_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群公告欄表';
