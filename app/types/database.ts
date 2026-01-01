// ============================================
// 資料庫類型定義
// 對應 MySQL 資料庫結構
// ============================================

/**
 * 使用者角色
 */
export type UserRole = 'admin' | 'member'

/**
 * 使用者
 */
export interface User {
  id: string
  account: string
  nickname: string
  email: string
  school: string | null
  password_hash: string
  created_at: Date
  updated_at: Date
}

/**
 * 社群
 */
export interface Community {
  id: string
  name: string
  description: string | null
  invite_code: string
  creator_id: string
  created_at: Date
  updated_at: Date
}

/**
 * 社群成員
 */
export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: UserRole
  joined_at: Date
}

/**
 * 社群成員詳細資訊（包含使用者資訊）
 */
export interface CommunityMemberDetail extends CommunityMember {
  account: string
  nickname: string
  email: string
  school: string | null
}

/**
 * 共備活動
 */
export interface Activity {
  id: string
  community_id: string
  name: string
  introduction: string | null
  creator_id: string
  is_public: boolean
  password: string | null
  created_at: Date
  updated_at: Date
}

/**
 * 活動詳細資訊（包含建立者資訊）
 */
export interface ActivityDetail extends Activity {
  creator_name: string
  creator_account: string
}

/**
 * 活動版本
 */
export interface ActivityVersion {
  id: string
  activity_id: string
  version_number: number
  modified_by: string
  lesson_plan_data: any // JSON 格式的教案資料
  created_at: Date
}

/**
 * 想法節點
 */
export interface Idea {
  id: string
  community_id: string
  creator_id: string
  stage: string | null
  title: string
  content: string | null
  parent_id: string | null
  position_x: number | null
  position_y: number | null
  rotation: number
  is_convergence: boolean
  converged_idea_ids: string[] | null // JSON 陣列
  created_at: Date
  updated_at: Date
}

/**
 * 想法節點詳細資訊（包含建立者資訊）
 */
export interface IdeaDetail extends Idea {
  creator_name: string
  creator_account: string
}

/**
 * 社群資源
 */
export interface Resource {
  id: string
  community_id: string
  file_name: string
  file_path: string | null
  file_size: number | null
  file_type: string | null
  uploaded_by: string | null
  created_at: Date
}

/**
 * 團隊分工列表
 */
export interface KanbanList {
  id: string
  community_id: string
  title: string
  sort_order: number
  created_at: Date
  updated_at: Date
}

/**
 * 團隊分工任務
 */
export interface KanbanTask {
  id: string
  list_id: string
  title: string
  content: string | null
  start_date: Date | null
  end_date: Date | null
  sort_order: number
  created_at: Date
  updated_at: Date
}

/**
 * 任務指派
 */
export interface TaskAssignee {
  id: string
  task_id: string
  user_id: string
  assigned_at: Date
}

// ============================================
// 權限檢查相關類型
// ============================================

/**
 * 權限檢查結果
 */
export interface PermissionResult {
  can_edit: boolean
  can_delete: boolean
  can_manage?: boolean // 用於社群管理
  is_creator?: boolean
  is_admin?: boolean
  is_member?: boolean
}

/**
 * 社群權限
 */
export interface CommunityPermission extends PermissionResult {
  is_creator: boolean
  is_admin: boolean
  is_member: boolean
}

/**
 * 活動權限
 */
export interface ActivityPermission extends PermissionResult {
  is_creator: boolean
  can_view: boolean // 考慮公開/非公開和密碼
}

/**
 * 想法節點權限
 */
export interface IdeaPermission extends PermissionResult {
  is_creator: boolean
  can_extend: boolean // 所有人都可以延伸想法
}


