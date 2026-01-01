# 教案編輯資料表說明

## 概述

此文件說明教案編輯功能所需的資料表結構。這些資料表補充了原本 `schema.sql` 中缺少的教案資料儲存功能。

## 資料表結構

### 1. lesson_plans（教案主表）

儲存教案的基本資訊，每個活動對應一個教案。

**主要欄位：**
- `activity_id` - 關聯到活動
- `lesson_plan_title` - 教案標題
- `course_domain` - 課程領域（國文、數學、英文、自然、社會）
- `designer` - 設計者
- `unit_name` - 單元名稱
- `implementation_grade` - 實施年級
- `teaching_time_lessons` - 授課節數
- `teaching_time_minutes` - 授課分鐘數
- `material_source` - 教材來源
- `teaching_equipment` - 教學設備/資源
- `learning_objectives` - 學習目標
- `assessment_tools` - 評量工具
- `references` - 參考資料

### 2. lesson_plan_core_competencies（教案核心素養表）

儲存教案的核心素養，一個教案可以有多筆核心素養。

**主要欄位：**
- `lesson_plan_id` - 關聯到教案
- `content` - 核心素養內容
- `sort_order` - 排序順序

### 3. lesson_plan_learning_performances（教案學習表現表）

儲存教案的學習表現，一個教案可以有多筆學習表現。

**主要欄位：**
- `lesson_plan_id` - 關聯到教案
- `code` - 學習表現代碼（如：INa-II-1）
- `description` - 學習表現描述
- `sort_order` - 排序順序

### 4. lesson_plan_learning_contents（教案學習內容表）

儲存教案的學習內容，一個教案可以有多筆學習內容。

**主要欄位：**
- `lesson_plan_id` - 關聯到教案
- `code` - 學習內容代碼（如：INa-II-1）
- `description` - 學習內容描述
- `sort_order` - 排序順序

### 5. lesson_plan_activity_rows（教案活動與評量設計表）

儲存教案的活動與評量設計，一個教案可以有多筆活動資料。

**主要欄位：**
- `lesson_plan_id` - 關聯到教案
- `teaching_content` - 教學內容及實施方式
- `teaching_time` - 教學時間
- `teaching_resources` - 教學資源
- `assessment_methods` - 學習評量方式
- `sort_order` - 排序順序

### 6. lesson_plan_specification_performances（雙向細目表-學習表現勾選狀態）

儲存雙向細目表中學習表現的勾選狀態。

**主要欄位：**
- `lesson_plan_id` - 關聯到教案
- `performance_id` - 關聯到學習表現
- `activity_row_id` - 關聯到活動行
- `is_checked` - 是否勾選

### 7. lesson_plan_specification_contents（雙向細目表-學習內容勾選狀態）

儲存雙向細目表中學習內容的勾選狀態。

**主要欄位：**
- `lesson_plan_id` - 關聯到教案
- `content_id` - 關聯到學習內容
- `activity_row_id` - 關聯到活動行
- `is_checked` - 是否勾選

## 安裝步驟

### 步驟 1：執行教案資料表建立腳本

```bash
mysql -u root -p teacher_collaboration_system < database/lesson_plans_schema.sql
```

或在 MySQL Workbench 中：
1. File → Open SQL Script
2. 選擇 `lesson_plans_schema.sql`
3. 執行腳本

### 步驟 2：更新 activity_versions 表（可選）

如果需要將版本管理與教案資料關聯：

```bash
mysql -u root -p teacher_collaboration_system < database/update_activity_versions.sql
```

## 資料關聯圖

```
activities (活動)
    ↓ (1:1)
lesson_plans (教案主表)
    ↓ (1:N)
    ├── lesson_plan_core_competencies (核心素養)
    ├── lesson_plan_learning_performances (學習表現)
    ├── lesson_plan_learning_contents (學習內容)
    └── lesson_plan_activity_rows (活動與評量設計)
            ↓ (N:N)
            ├── lesson_plan_specification_performances (學習表現勾選)
            └── lesson_plan_specification_contents (學習內容勾選)
```

## 後端 API 實作建議

### 儲存教案資料

當使用者點擊「儲存」按鈕時，後端應該：

1. **檢查教案是否存在**
   ```sql
   SELECT id FROM lesson_plans WHERE activity_id = ?
   ```

2. **如果不存在，建立新教案**
   ```sql
   INSERT INTO lesson_plans (id, activity_id, lesson_plan_title, ...) VALUES (...)
   ```

3. **如果存在，更新教案**
   ```sql
   UPDATE lesson_plans SET lesson_plan_title = ?, ... WHERE id = ?
   ```

4. **刪除舊的關聯資料（核心素養、學習表現等）**
   ```sql
   DELETE FROM lesson_plan_core_competencies WHERE lesson_plan_id = ?
   DELETE FROM lesson_plan_learning_performances WHERE lesson_plan_id = ?
   -- ... 其他表
   ```

5. **插入新的關聯資料**
   ```sql
   INSERT INTO lesson_plan_core_competencies (id, lesson_plan_id, content, sort_order) VALUES (...)
   -- ... 其他表
   ```

6. **建立新版本記錄**
   ```sql
   INSERT INTO activity_versions (id, activity_id, lesson_plan_id, version_number, modified_by, lesson_plan_data) 
   VALUES (..., JSON_OBJECT(...))
   ```

### 讀取教案資料

當使用者進入教案編輯頁面時，後端應該：

1. **取得教案主資料**
   ```sql
   SELECT * FROM lesson_plans WHERE activity_id = ?
   ```

2. **取得核心素養**
   ```sql
   SELECT * FROM lesson_plan_core_competencies 
   WHERE lesson_plan_id = ? 
   ORDER BY sort_order
   ```

3. **取得學習表現**
   ```sql
   SELECT * FROM lesson_plan_learning_performances 
   WHERE lesson_plan_id = ? 
   ORDER BY sort_order
   ```

4. **取得學習內容**
   ```sql
   SELECT * FROM lesson_plan_learning_contents 
   WHERE lesson_plan_id = ? 
   ORDER BY sort_order
   ```

5. **取得活動與評量設計**
   ```sql
   SELECT * FROM lesson_plan_activity_rows 
   WHERE lesson_plan_id = ? 
   ORDER BY sort_order
   ```

6. **取得雙向細目表勾選狀態**
   ```sql
   SELECT * FROM lesson_plan_specification_performances 
   WHERE lesson_plan_id = ?
   
   SELECT * FROM lesson_plan_specification_contents 
   WHERE lesson_plan_id = ?
   ```

## 注意事項

1. **唯一性約束**：每個活動只能有一個教案（透過 `unique_activity_lesson_plan` 約束）

2. **級聯刪除**：刪除活動時，相關的教案資料會自動刪除（透過 `ON DELETE CASCADE`）

3. **版本管理**：每次儲存時，應該在 `activity_versions` 表中建立新版本記錄

4. **排序**：所有關聯表都包含 `sort_order` 欄位，用於維持資料的顯示順序

5. **雙向細目表**：勾選狀態儲存在獨立的表中，方便查詢和管理


