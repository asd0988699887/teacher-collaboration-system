# 完整資料庫安裝指南

## 概述

此文件提供完整的資料庫安裝步驟，包括所有必要的資料表結構。

## 安裝順序

### 步驟 1：建立基礎資料庫結構

執行 `schema.sql` 建立核心資料表：
- users（使用者）
- communities（社群）
- community_members（社群成員）
- activities（共備活動）
- activity_versions（活動版本）
- ideas（想法節點）
- resources（社群資源）
- kanban_lists（團隊分工列表）
- kanban_tasks（團隊分工任務）
- task_assignees（任務指派）

**執行方式：**
```bash
mysql -u root -p < database/schema.sql
```

或在 MySQL Workbench 中：
1. File → Open SQL Script
2. 選擇 `schema.sql`
3. 執行腳本（⚡ 按鈕或 Ctrl+Shift+Enter）

### 步驟 2：建立權限檢查函數（可選，建議）

執行 `permissions.sql` 建立權限檢查函數：
- is_community_creator()
- is_activity_creator()
- is_idea_creator()
- is_community_admin()
- is_community_member()

**執行方式：**
```bash
mysql -u root -p teacher_collaboration_system < database/permissions.sql
```

### 步驟 3：建立教案編輯資料表（必須）

執行 `lesson_plans_schema.sql` 建立教案相關資料表：
- lesson_plans（教案主表）
- lesson_plan_core_competencies（核心素養）
- lesson_plan_learning_performances（學習表現）
- lesson_plan_learning_contents（學習內容）
- lesson_plan_activity_rows（活動與評量設計）
- lesson_plan_specification_performances（雙向細目表-學習表現）
- lesson_plan_specification_contents（雙向細目表-學習內容）

**執行方式：**
```bash
mysql -u root -p teacher_collaboration_system < database/lesson_plans_schema.sql
```

或在 MySQL Workbench 中：
1. File → Open SQL Script
2. 選擇 `lesson_plans_schema.sql`
3. 執行腳本

### 步驟 4：更新 activity_versions 表（可選）

如果需要將版本管理與教案資料關聯，執行 `update_activity_versions.sql`：

**執行方式：**
```bash
mysql -u root -p teacher_collaboration_system < database/update_activity_versions.sql
```

## 驗證安裝

執行以下 SQL 查詢來驗證所有表都已建立：

```sql
USE teacher_collaboration_system;

-- 檢查所有表
SHOW TABLES;

-- 應該看到以下表：
-- users
-- communities
-- community_members
-- activities
-- activity_versions
-- ideas
-- resources
-- kanban_lists
-- kanban_tasks
-- task_assignees
-- lesson_plans
-- lesson_plan_core_competencies
-- lesson_plan_learning_performances
-- lesson_plan_learning_contents
-- lesson_plan_activity_rows
-- lesson_plan_specification_performances
-- lesson_plan_specification_contents

-- 檢查函數
SHOW FUNCTION STATUS WHERE Db = 'teacher_collaboration_system';

-- 檢查視圖
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

## 資料庫結構總覽

### 核心功能表（schema.sql）

1. **使用者與社群**
   - users - 使用者
   - communities - 社群
   - community_members - 社群成員（含角色）

2. **活動與版本**
   - activities - 共備活動
   - activity_versions - 活動版本

3. **想法牆**
   - ideas - 想法節點

4. **資源與分工**
   - resources - 社群資源
   - kanban_lists - 團隊分工列表
   - kanban_tasks - 團隊分工任務
   - task_assignees - 任務指派

### 教案編輯表（lesson_plans_schema.sql）

5. **教案主表**
   - lesson_plans - 教案主表

6. **教案關聯表**
   - lesson_plan_core_competencies - 核心素養
   - lesson_plan_learning_performances - 學習表現
   - lesson_plan_learning_contents - 學習內容
   - lesson_plan_activity_rows - 活動與評量設計

7. **雙向細目表**
   - lesson_plan_specification_performances - 學習表現勾選
   - lesson_plan_specification_contents - 學習內容勾選

## 目前狀態

✅ **已完成：**
- 基礎資料庫結構（schema.sql）
- 權限檢查函數（permissions.sql）
- 教案編輯資料表（lesson_plans_schema.sql）
- 版本管理更新（update_activity_versions.sql）

✅ **資料庫已完善：**
- 所有必要的資料表都已建立
- 權限控制機制已實作
- 教案編輯功能所需的資料表已建立

⚠️ **待後端實作：**
- 後端 API 需要實作教案資料的儲存和讀取邏輯
- 目前前端的 `handleSave` 函數只儲存到 localStorage，需要改為呼叫後端 API

## 下一步

1. **後端開發**：實作教案資料的 CRUD API
2. **前端整合**：將 `CourseObjectives.tsx` 中的 `handleSave` 改為呼叫後端 API
3. **測試**：測試教案的儲存、讀取、版本管理功能

## 相關文件

- [README.md](./README.md) - 權限控制規則說明
- [README_LESSON_PLANS.md](./README_LESSON_PLANS.md) - 教案資料表詳細說明
- [api-examples.md](./api-examples.md) - 後端 API 實作範例
- [INSTALLATION.md](./INSTALLATION.md) - 基礎安裝指南


