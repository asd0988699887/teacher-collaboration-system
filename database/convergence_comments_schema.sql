-- ============================================
-- 收斂討論區留言表
-- ============================================

USE teacher_collaboration_system;

-- 建立收斂討論區留言表
CREATE TABLE IF NOT EXISTS convergence_comments (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    stage VARCHAR(50) NOT NULL COMMENT '收斂階段',
    content TEXT NOT NULL COMMENT '留言內容',
    author_id VARCHAR(36) NOT NULL COMMENT '留言者ID',
    author_account VARCHAR(50) NOT NULL COMMENT '留言者帳號（快取，避免頻繁 JOIN）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_community_stage (community_id, stage),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收斂討論區留言表';

