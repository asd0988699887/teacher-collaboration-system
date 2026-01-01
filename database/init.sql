-- ============================================
-- 初始化資料庫（可選）
-- 用於開發測試環境
-- ============================================

USE teacher_collaboration_system;

-- 插入測試使用者（密碼為 'password123' 的 bcrypt hash，實際使用時請替換）
-- 注意：這裡的密碼雜湊僅供測試，實際環境請使用安全的密碼雜湊
INSERT INTO users (id, account, nickname, email, school, password_hash) VALUES
('user-001', 'testuser1', '測試使用者1', 'test1@example.com', '測試國小', '$2b$10$example_hash_here'),
('user-002', 'testuser2', '測試使用者2', 'test2@example.com', '測試國中', '$2b$10$example_hash_here'),
('user-003', 'admin', '管理員', 'admin@example.com', '中央國小', '$2b$10$example_hash_here')
ON DUPLICATE KEY UPDATE account=account;

-- 注意：實際使用時，請確保：
-- 1. 使用安全的密碼雜湊演算法（如 bcrypt）
-- 2. 不要將真實密碼雜湊直接寫在 SQL 腳本中
-- 3. 在生產環境中移除測試資料


