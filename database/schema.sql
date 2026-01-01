-- ============================================
-- 教師共同備課系統 MySQL 資料庫架構
-- ============================================

-- 建立資料庫
CREATE DATABASE IF NOT EXISTS teacher_collaboration_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE teacher_collaboration_system;

-- ============================================
-- 1. 使用者表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    account VARCHAR(50) UNIQUE NOT NULL COMMENT '帳號',
    nickname VARCHAR(100) NOT NULL COMMENT '暱稱',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '電子郵件',
    school VARCHAR(255) COMMENT '學校',
    password_hash VARCHAR(255) NOT NULL COMMENT '密碼雜湊',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    INDEX idx_account (account),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用者表';

-- ============================================
-- 2. 社群表
-- ============================================
CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '社群名稱',
    description TEXT COMMENT '社群描述',
    invite_code VARCHAR(50) UNIQUE NOT NULL COMMENT '邀請碼',
    creator_id VARCHAR(36) NOT NULL COMMENT '建立者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_creator (creator_id),
    INDEX idx_invite_code (invite_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群表';

-- ============================================
-- 3. 社群成員表（包含角色權限）
-- ============================================
CREATE TABLE IF NOT EXISTS community_members (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    user_id VARCHAR(36) NOT NULL COMMENT '使用者ID',
    role ENUM('admin', 'member') DEFAULT 'member' COMMENT '角色：admin=管理員, member=一般成員',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_community_user (community_id, user_id),
    INDEX idx_community (community_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群成員表';

-- ============================================
-- 4. 共備活動表
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    name VARCHAR(255) NOT NULL COMMENT '活動名稱',
    introduction TEXT COMMENT '活動介紹',
    creator_id VARCHAR(36) NOT NULL COMMENT '建立者ID',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公開',
    password VARCHAR(255) COMMENT '密碼（如果非公開）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_community (community_id),
    INDEX idx_creator (creator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='共備活動表';

-- ============================================
-- 5. 活動版本表（版本管理）
-- ============================================
CREATE TABLE IF NOT EXISTS activity_versions (
    id VARCHAR(36) PRIMARY KEY,
    activity_id VARCHAR(36) NOT NULL COMMENT '活動ID',
    version_number INT NOT NULL COMMENT '版本流水編號',
    modified_by VARCHAR(36) NOT NULL COMMENT '最後修改者ID',
    lesson_plan_data JSON COMMENT '教案資料（JSON格式）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity (activity_id),
    INDEX idx_version (activity_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活動版本表';

-- ============================================
-- 6. 想法節點表
-- ============================================
CREATE TABLE IF NOT EXISTS ideas (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    creator_id VARCHAR(36) NOT NULL COMMENT '建立者ID',
    stage VARCHAR(50) COMMENT '階段',
    title VARCHAR(255) NOT NULL COMMENT '標題',
    content TEXT COMMENT '內容',
    parent_id VARCHAR(36) COMMENT '父節點ID（延伸關係）',
    position_x DECIMAL(10, 2) COMMENT 'X座標',
    position_y DECIMAL(10, 2) COMMENT 'Y座標',
    rotation DECIMAL(5, 2) DEFAULT 0 COMMENT '旋轉角度',
    is_convergence BOOLEAN DEFAULT FALSE COMMENT '是否為收斂結果節點',
    converged_idea_ids JSON COMMENT '被收斂的想法節點IDs（JSON陣列）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES ideas(id) ON DELETE SET NULL,
    INDEX idx_community (community_id),
    INDEX idx_creator (creator_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='想法節點表';

-- ============================================
-- 7. 社群資源表（無權限限制）
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    file_name VARCHAR(255) NOT NULL COMMENT '檔案名稱',
    file_path VARCHAR(500) COMMENT '檔案路徑',
    file_size BIGINT COMMENT '檔案大小（bytes）',
    file_type VARCHAR(100) COMMENT '檔案類型',
    uploaded_by VARCHAR(36) COMMENT '上傳者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上傳時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_community (community_id),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群資源表';

-- ============================================
-- 8. 團隊分工列表表（無權限限制）
-- ============================================
CREATE TABLE IF NOT EXISTS kanban_lists (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    title VARCHAR(255) NOT NULL COMMENT '列表標題',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    INDEX idx_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊分工列表表';

-- ============================================
-- 9. 團隊分工任務表（無權限限制）
-- ============================================
CREATE TABLE IF NOT EXISTS kanban_tasks (
    id VARCHAR(36) PRIMARY KEY,
    list_id VARCHAR(36) NOT NULL COMMENT '列表ID',
    title VARCHAR(255) NOT NULL COMMENT '任務標題',
    content TEXT COMMENT '任務內容',
    start_date DATE COMMENT '開始日期',
    end_date DATE COMMENT '結束日期',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (list_id) REFERENCES kanban_lists(id) ON DELETE CASCADE,
    INDEX idx_list (list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊分工任務表';

-- ============================================
-- 10. 任務指派表（多對多關係）
-- ============================================
CREATE TABLE IF NOT EXISTS task_assignees (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL COMMENT '任務ID',
    user_id VARCHAR(36) NOT NULL COMMENT '被指派的使用者ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '指派時間',
    FOREIGN KEY (task_id) REFERENCES kanban_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_task_user (task_id, user_id),
    INDEX idx_task (task_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任務指派表';

-- ============================================
-- 觸發器：自動將社群建立者設為管理員
-- ============================================
DELIMITER $$

-- 先刪除已存在的觸發器（如果存在）
DROP TRIGGER IF EXISTS after_community_create;

CREATE TRIGGER after_community_create
AFTER INSERT ON communities
FOR EACH ROW
BEGIN
    INSERT INTO community_members (id, community_id, user_id, role)
    VALUES (
        UUID(),
        NEW.id,
        NEW.creator_id,
        'admin'
    );
END$$

DELIMITER ;

-- ============================================
-- 視圖：社群成員詳細資訊（包含使用者資訊）
-- ============================================
CREATE OR REPLACE VIEW community_members_detail AS
SELECT 
    cm.id,
    cm.community_id,
    cm.user_id,
    cm.role,
    cm.joined_at,
    u.account,
    u.nickname,
    u.email,
    u.school
FROM community_members cm
INNER JOIN users u ON cm.user_id = u.id;

-- ============================================
-- 視圖：活動詳細資訊（包含建立者資訊）
-- ============================================
CREATE OR REPLACE VIEW activities_detail AS
SELECT 
    a.id,
    a.community_id,
    a.name,
    a.introduction,
    a.creator_id,
    a.is_public,
    a.created_at,
    a.updated_at,
    u.nickname AS creator_name,
    u.account AS creator_account
FROM activities a
INNER JOIN users u ON a.creator_id = u.id;

-- ============================================
-- 視圖：想法節點詳細資訊（包含建立者資訊）
-- ============================================
CREATE OR REPLACE VIEW ideas_detail AS
SELECT 
    i.id,
    i.community_id,
    i.creator_id,
    i.stage,
    i.title,
    i.content,
    i.parent_id,
    i.position_x,
    i.position_y,
    i.rotation,
    i.is_convergence,
    i.converged_idea_ids,
    i.created_at,
    i.updated_at,
    u.nickname AS creator_name,
    u.account AS creator_account
FROM ideas i
INNER JOIN users u ON i.creator_id = u.id;
