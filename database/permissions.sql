-- ============================================
-- 權限檢查函數
-- 用於後端 API 權限驗證
-- ============================================

USE teacher_collaboration_system;

-- ============================================
-- 函數：檢查使用者是否為社群建立者
-- ============================================
DELIMITER $$

DROP FUNCTION IF EXISTS is_community_creator$$

CREATE FUNCTION is_community_creator(
    p_community_id VARCHAR(36),
    p_user_id VARCHAR(36)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_creator BOOLEAN DEFAULT FALSE;
    
    SELECT COUNT(*) > 0 INTO v_is_creator
    FROM communities
    WHERE id = p_community_id 
      AND creator_id = p_user_id;
    
    RETURN v_is_creator;
END$$

-- ============================================
-- 函數：檢查使用者是否為活動建立者
-- ============================================
DROP FUNCTION IF EXISTS is_activity_creator$$

CREATE FUNCTION is_activity_creator(
    p_activity_id VARCHAR(36),
    p_user_id VARCHAR(36)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_creator BOOLEAN DEFAULT FALSE;
    
    SELECT COUNT(*) > 0 INTO v_is_creator
    FROM activities
    WHERE id = p_activity_id 
      AND creator_id = p_user_id;
    
    RETURN v_is_creator;
END$$

-- ============================================
-- 函數：檢查使用者是否為想法節點建立者
-- ============================================
DROP FUNCTION IF EXISTS is_idea_creator$$

CREATE FUNCTION is_idea_creator(
    p_idea_id VARCHAR(36),
    p_user_id VARCHAR(36)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_creator BOOLEAN DEFAULT FALSE;
    
    SELECT COUNT(*) > 0 INTO v_is_creator
    FROM ideas
    WHERE id = p_idea_id 
      AND creator_id = p_user_id;
    
    RETURN v_is_creator;
END$$

-- ============================================
-- 函數：檢查使用者是否為社群管理員
-- ============================================
DROP FUNCTION IF EXISTS is_community_admin$$

CREATE FUNCTION is_community_admin(
    p_community_id VARCHAR(36),
    p_user_id VARCHAR(36)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_admin BOOLEAN DEFAULT FALSE;
    
    SELECT COUNT(*) > 0 INTO v_is_admin
    FROM community_members
    WHERE community_id = p_community_id 
      AND user_id = p_user_id
      AND role = 'admin';
    
    RETURN v_is_admin;
END$$

-- ============================================
-- 函數：檢查使用者是否為社群成員
-- ============================================
DROP FUNCTION IF EXISTS is_community_member$$

CREATE FUNCTION is_community_member(
    p_community_id VARCHAR(36),
    p_user_id VARCHAR(36)
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_member BOOLEAN DEFAULT FALSE;
    
    SELECT COUNT(*) > 0 INTO v_is_member
    FROM community_members
    WHERE community_id = p_community_id 
      AND user_id = p_user_id;
    
    RETURN v_is_member;
END$$

DELIMITER ;

-- ============================================
-- 使用範例
-- ============================================

-- 檢查使用者是否為社群建立者
-- SELECT is_community_creator('community-id', 'user-id') AS can_edit_community;

-- 檢查使用者是否為活動建立者
-- SELECT is_activity_creator('activity-id', 'user-id') AS can_edit_activity;

-- 檢查使用者是否為想法節點建立者
-- SELECT is_idea_creator('idea-id', 'user-id') AS can_edit_idea;

-- 檢查使用者是否為社群管理員
-- SELECT is_community_admin('community-id', 'user-id') AS can_manage_members;

-- 檢查使用者是否為社群成員
-- SELECT is_community_member('community-id', 'user-id') AS is_member;

