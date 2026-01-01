# 教案資料多筆關係說明

## 資料結構說明

### 1. 核心素養（多筆）

**前端資料結構：**
```typescript
addedCoreCompetencies: Array<{
  content: string  // 核心素養內容
}>
```

**資料庫設計：**
- `lesson_plan_core_competencies` 表
- 一個教案可以有多筆核心素養記錄
- 每筆記錄包含：`content`（核心素養內容）

**範例：**
```
教案 A 可能有：
- 核心素養 1: "A1 身心素質與自我精進"
- 核心素養 2: "A2 系統思考與解決問題"
- 核心素養 3: "B1 符號運用與溝通表達"
```

### 2. 學習表現（多筆）

**前端資料結構：**
```typescript
addedLearningPerformances: Array<{
  content: Array<{
    code: string        // 如：INa-II-1
    description: string // 學習表現描述
  }>
}>
```

**資料庫設計：**
- `lesson_plan_learning_performances` 表
- 一個教案可以有多筆學習表現記錄
- 每筆記錄包含：`code`（代碼）和 `description`（描述）
- **注意**：前端是分組的，但資料庫中會展開為多筆記錄

**範例：**
```
教案 A 可能有：
- 學習表現 1: code="INa-II-1", description="自然界（包含生物與非生物）是由不同物質所組成。"
- 學習表現 2: code="INa-II-2", description="在地球上，物質具有重量，佔有體積。"
- 學習表現 3: code="INa-II-3", description="物質各有其特性，並可以依其特性與用途進行分類。"
- ...（可能有很多筆）
```

### 3. 學習內容（多筆）

**前端資料結構：**
```typescript
addedLearningContents: Array<{
  content: Array<{
    code: string        // 如：INa-II-1
    description: string // 學習內容描述
  }>
}>
```

**資料庫設計：**
- `lesson_plan_learning_contents` 表
- 一個教案可以有多筆學習內容記錄
- 每筆記錄包含：`code`（代碼）和 `description`（描述）
- **注意**：前端是分組的，但資料庫中會展開為多筆記錄

**範例：**
```
教案 A 可能有：
- 學習內容 1: code="INa-II-1", description="..."
- 學習內容 2: code="INa-II-2", description="..."
- 學習內容 3: code="INa-II-3", description="..."
- ...（可能有很多筆）
```

### 4. 活動與評量設計（多筆）

**前端資料結構：**
```typescript
activityRows: Array<{
  id: string
  teachingContent: string    // 教學內容及實施方式
  teachingTime: string       // 教學時間
  teachingResources: string  // 教學資源
  assessmentMethods: string  // 學習評量方式
}>
```

**資料庫設計：**
- `lesson_plan_activity_rows` 表
- 一個教案可以有多筆活動記錄
- 每筆記錄包含：教學內容、教學時間、教學資源、學習評量方式

**範例：**
```
教案 A 可能有：
- 活動 1: 教學內容="...", 教學時間="10分鐘", ...
- 活動 2: 教學內容="...", 教學時間="15分鐘", ...
- 活動 3: 教學內容="...", 教學時間="20分鐘", ...
- ...（可能有很多筆）
```

### 5. 雙向細目表（多筆勾選狀態）

#### 5.1 學習表現勾選狀態

**前端資料結構：**
```typescript
checkedPerformances: Set<string>
// key 格式: "perf-${perfIndex}-${perfContentIndex}-${actIndex}"
```

**資料庫設計：**
- `lesson_plan_specification_performances` 表
- **多對多關係**：每個學習表現 × 每個活動行 = 一筆勾選記錄
- 如果一個教案有 5 個學習表現和 3 個活動行，最多可能有 15 筆勾選記錄

**範例：**
```
教案 A 有：
- 學習表現：5 筆
- 活動行：3 筆

可能的勾選記錄：
- 學習表現1 × 活動行1 → 已勾選
- 學習表現1 × 活動行2 → 未勾選
- 學習表現1 × 活動行3 → 已勾選
- 學習表現2 × 活動行1 → 已勾選
- ...（總共最多 5×3=15 筆）
```

#### 5.2 學習內容勾選狀態

**前端資料結構：**
```typescript
checkedContents: Set<string>
// key 格式: "cont-${contIndex}-${contContentIndex}-${actIndex}"
```

**資料庫設計：**
- `lesson_plan_specification_contents` 表
- **多對多關係**：每個學習內容 × 每個活動行 = 一筆勾選記錄
- 如果一個教案有 8 個學習內容和 3 個活動行，最多可能有 24 筆勾選記錄

**範例：**
```
教案 A 有：
- 學習內容：8 筆
- 活動行：3 筆

可能的勾選記錄：
- 學習內容1 × 活動行1 → 已勾選
- 學習內容1 × 活動行2 → 未勾選
- 學習內容1 × 活動行3 → 已勾選
- 學習內容2 × 活動行1 → 已勾選
- ...（總共最多 8×3=24 筆）
```

## 資料關聯圖

```
lesson_plans (教案主表)
    │
    ├── lesson_plan_core_competencies (1:N)
    │   └── 多筆核心素養記錄
    │
    ├── lesson_plan_learning_performances (1:N)
    │   └── 多筆學習表現記錄（展開後）
    │
    ├── lesson_plan_learning_contents (1:N)
    │   └── 多筆學習內容記錄（展開後）
    │
    └── lesson_plan_activity_rows (1:N)
        └── 多筆活動記錄
            │
            ├── lesson_plan_specification_performances (N:N)
            │   └── 學習表現 × 活動行 = 多筆勾選記錄
            │
            └── lesson_plan_specification_contents (N:N)
                └── 學習內容 × 活動行 = 多筆勾選記錄
```

## 資料儲存邏輯

### 儲存學習表現時

**前端資料：**
```javascript
addedLearningPerformances = [
  {
    content: [
      { code: "INa-II-1", description: "..." },
      { code: "INa-II-2", description: "..." }
    ]
  },
  {
    content: [
      { code: "INa-II-3", description: "..." }
    ]
  }
]
```

**資料庫儲存（展開後）：**
```sql
-- 會儲存為 3 筆記錄
INSERT INTO lesson_plan_learning_performances (id, lesson_plan_id, code, description, sort_order) VALUES
('id1', 'lesson_plan_id', 'INa-II-1', '...', 1),
('id2', 'lesson_plan_id', 'INa-II-2', '...', 2),
('id3', 'lesson_plan_id', 'INa-II-3', '...', 3);
```

### 儲存雙向細目表勾選狀態時

**前端資料：**
```javascript
checkedPerformances = Set([
  "perf-0-0-0",  // 學習表現組0的第0個內容 × 活動行0
  "perf-0-1-1",  // 學習表現組0的第1個內容 × 活動行1
  "perf-1-0-2"   // 學習表現組1的第0個內容 × 活動行2
])
```

**資料庫儲存：**
```sql
-- 需要將前端的 key 轉換為 performance_id 和 activity_row_id
-- 假設：
-- - performance_id 對應到學習表現記錄的 id
-- - activity_row_id 對應到活動行的 id

INSERT INTO lesson_plan_specification_performances 
  (id, lesson_plan_id, performance_id, activity_row_id, is_checked) VALUES
('id1', 'lesson_plan_id', 'performance_id_1', 'activity_row_id_1', TRUE),
('id2', 'lesson_plan_id', 'performance_id_2', 'activity_row_id_2', TRUE),
('id3', 'lesson_plan_id', 'performance_id_3', 'activity_row_id_3', TRUE);
```

## 後端 API 實作建議

### 儲存教案資料

1. **儲存教案主表**
2. **刪除舊的核心素養、學習表現、學習內容、活動行**
3. **插入新的核心素養（多筆）**
4. **插入新的學習表現（多筆，展開後）**
5. **插入新的學習內容（多筆，展開後）**
6. **插入新的活動行（多筆）**
7. **刪除舊的雙向細目表勾選狀態**
8. **插入新的雙向細目表勾選狀態（多筆）**

### 讀取教案資料

1. **讀取教案主表**
2. **讀取所有核心素養（多筆）**
3. **讀取所有學習表現（多筆）**
4. **讀取所有學習內容（多筆）**
5. **讀取所有活動行（多筆）**
6. **讀取所有雙向細目表勾選狀態（多筆）**
7. **組合成前端需要的格式**

## 注意事項

1. **資料展開**：前端的學習表現和學習內容是分組的，但資料庫中需要展開為多筆記錄

2. **排序**：所有多筆資料都使用 `sort_order` 欄位來維持順序

3. **雙向細目表**：勾選狀態是學習表現/學習內容與活動行的多對多關係，需要正確對應

4. **效能考量**：如果資料量很大，建議使用批次插入（BATCH INSERT）

5. **唯一性**：雙向細目表的勾選狀態使用 `UNIQUE KEY` 確保不會重複


