-- 聊天室訊息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    content TEXT NOT NULL COMMENT '訊息內容',
    sender_id VARCHAR(36) COMMENT '發送者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '發送時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_community (community_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天室訊息表';
