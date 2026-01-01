# 後端 API 設定與使用說明

## 環境變數設定

1. 在 `phototype-ui` 目錄下建立 `.env.local` 檔案（或複製 `.env.example`）：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的資料庫密碼
DB_NAME=teacher_collaboration_system
```

2. 確保資料庫已建立並執行所有 SQL 腳本：
   - `schema.sql`
   - `permissions.sql`
   - `lesson_plans_schema.sql`
   - `update_activity_versions.sql`

## API 端點

### 1. 教案資料 API

#### GET `/api/lesson-plans/[activityId]`
讀取指定活動的教案資料

**回應格式：**
```json
{
  "lessonPlan": {
    "id": "...",
    "activityId": "...",
    "lessonPlanTitle": "...",
    ...
  },
  "coreCompetencies": [...],
  "learningPerformances": [...],
  "learningContents": [...],
  "activityRows": [...],
  "specificationPerformances": [...],
  "specificationContents": [...]
}
```

#### POST `/api/lesson-plans/[activityId]`
儲存教案資料並建立新版本

**請求格式：**
```json
{
  "userId": "使用者ID",
  "lessonPlanTitle": "教案標題",
  "courseDomain": "課程領域",
  "designer": "設計者",
  "unitName": "單元名稱",
  "implementationGrade": "實施年級",
  "teachingTimeLessons": "授課節數",
  "teachingTimeMinutes": "授課分鐘數",
  "materialSource": "教材來源",
  "teachingEquipment": "教學設備/資源",
  "learningObjectives": "學習目標",
  "addedCoreCompetencies": [...],
  "addedLearningPerformances": [...],
  "addedLearningContents": [...],
  "activityRows": [...],
  "assessmentTools": "評量工具",
  "references": "參考資料",
  "checkedPerformances": [...],
  "checkedContents": [...]
}
```

**回應格式：**
```json
{
  "success": true,
  "message": "教案資料儲存成功",
  "data": {
    "lessonPlanId": "...",
    "versionNumber": 1
  }
}
```

### 2. 版本管理 API

#### GET `/api/activity-versions/[activityId]`
讀取指定活動的所有版本

**回應格式：**
```json
{
  "versions": [
    {
      "id": "版本ID",
      "versionNumber": 1,
      "lastModifiedDate": "2025/11/15",
      "lastModifiedTime": "14:30",
      "lastModifiedUser": "使用者暱稱",
      "userId": "使用者ID"
    }
  ]
}
```

## 前端整合

### 儲存教案資料

在 `CourseObjectives.tsx` 中，`handleSave` 函數已更新為呼叫 API：

```typescript
const handleSave = async () => {
  // ... 收集表單資料 ...
  
  const response = await fetch(`/api/lesson-plans/${activityId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
  
  // ... 處理回應 ...
}
```

### 讀取版本列表

在 `VersionControlModal.tsx` 中，版本資料會自動從 API 載入：

```typescript
useEffect(() => {
  const loadVersions = async () => {
    const response = await fetch(`/api/activity-versions/${activityId}`)
    const data = await response.json()
    setVersions(data.versions)
  }
  loadVersions()
}, [isOpen, activityId])
```

## 注意事項

1. **使用者 ID**：目前從 `localStorage` 的 `user` 物件中取得 `id` 或 `account`。請確保登入時有正確儲存使用者資訊。

2. **資料格式**：
   - `addedLearningPerformances` 和 `addedLearningContents` 需要是分組格式（包含 `content` 陣列）
   - `checkedPerformances` 和 `checkedContents` 是字串陣列，格式為 `"perf-{perfIndex}-{perfContentIndex}-{actIndex}"`

3. **錯誤處理**：API 會回傳錯誤訊息，前端需要適當處理並顯示給使用者。

4. **資料庫連接**：確保 MySQL 服務正在運行，且連接資訊正確。

## 測試

1. 啟動開發伺服器：`npm run dev`
2. 確保資料庫已建立並有測試資料
3. 在瀏覽器中測試儲存和讀取功能
4. 檢查瀏覽器控制台和伺服器日誌是否有錯誤


