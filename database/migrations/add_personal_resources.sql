-- 個人資源表
CREATE TABLE IF NOT EXISTS personal_resources (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT '擁有者ID',
    file_name VARCHAR(255) NOT NULL COMMENT '檔案名稱',
    file_path VARCHAR(500) COMMENT '檔案路徑',
    file_size BIGINT COMMENT '檔案大小（bytes）',
    file_type VARCHAR(100) COMMENT '檔案類型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上傳時間',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='個人資源表';
