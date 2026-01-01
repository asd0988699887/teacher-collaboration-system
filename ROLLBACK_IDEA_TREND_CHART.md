# 社群想法貢獻數量變化圖表回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：移除新創建的文件

刪除以下文件：
- `app/components/IdeaTrendChart.tsx`

### 步驟 2：恢復 CommunityDetail.tsx

在 `app/components/CommunityDetail.tsx` 文件中：

1. **移除導入語句**（約第 18-19 行）：
   ```typescript
   // 移除這行：
   import IdeaTrendChart from './IdeaTrendChart'
   ```

2. **恢復佔位訊息**（約第 2325-2329 行）：
   ```typescript
   {activeHistoryChart === 'trend' && (
     <div className="flex items-center justify-center h-96 text-gray-400">
       <p className="text-lg">社群想法貢獻數量變化圖表功能開發中</p>
     </div>
   )}
   ```
   替換為：
   ```typescript
   {activeHistoryChart === 'trend' && (
     <IdeaTrendChart communityId={communityId} />
   )}
   ```

### 步驟 3：清除 Next.js 快取（可選）

如果回滾後仍有問題，可以清除快取：

```bash
# Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# 或使用命令提示字元
rmdir /s /q .next
```

### 步驟 4：重新啟動系統

```bash
npm run dev
```

## 注意事項

- 此回滾不會影響資料庫資料
- API `/api/communities/[communityId]/idea-trend` 仍會保留（不會影響其他功能）
- 只會移除前端圖表組件，回到之前的佔位狀態

## 修改摘要

### 新增的功能：
- 想法趨勢圖表組件：`IdeaTrendChart.tsx`
- 顯示最近30天每個使用者的想法建立數量變化
- 使用折線圖（recharts LineChart）顯示趨勢
- 每個使用者不同顏色的線
- 支援圖例互動（點擊可顯示/隱藏特定使用者的線）
- 滑鼠懸停顯示詳細資訊

### 修改的文件：
- `app/components/IdeaTrendChart.tsx`（新文件）
- `app/components/CommunityDetail.tsx`（添加導入和使用組件）

### 功能特點：

- ✅ 調用 `/api/communities/[communityId]/idea-trend` API
- ✅ 處理載入、錯誤、空資料狀態
- ✅ 動態高度調整（根據使用者數量）
- ✅ 日期格式化顯示（MM/DD）
- ✅ 10種不同顏色循環使用
- ✅ 響應式設計
- ✅ 工具提示顯示完整日期和使用者資訊
- ✅ X軸日期自動間隔顯示（避免擁擠）

### 圖表規格：

- **圖表類型**：折線圖（LineChart）
- **X軸**：日期（最近30天，格式：MM/DD）
- **Y軸**：想法建立數量
- **每條線**：代表一個使用者
- **顏色**：10種預定義顏色循環使用
- **互動**：
  - 點擊圖例可顯示/隱藏特定使用者的線
  - 滑鼠懸停顯示詳細資訊（完整日期、使用者名稱、數量）

## 技術細節

### 資料轉換：

API 返回格式：
```typescript
{
  dateRange: { startDate: "2024-06-01", endDate: "2024-06-30", days: 30 },
  userStats: [
    {
      userId: "xxx",
      userName: "使用者A",
      dailyCounts: [
        { date: "2024-06-01", count: 1 },
        { date: "2024-06-02", count: 0 },
        ...
      ]
    }
  ]
}
```

轉換為 recharts LineChart 格式：
```typescript
[
  { date: "6/1", fullDate: "2024-06-01", "使用者A": 1, "使用者B": 0 },
  { date: "6/2", fullDate: "2024-06-02", "使用者A": 0, "使用者B": 2 },
  ...
]
```

### 顏色配置：

使用 10 種預定義顏色循環分配給使用者：
1. #8B5CF6 (紫色)
2. #3B82F6 (藍色)
3. #10B981 (綠色)
4. #F59E0B (黃色)
5. #EF4444 (紅色)
6. #06B6D4 (青色)
7. #EC4899 (粉紅色)
8. #6366F1 (靛色)
9. #14B8A6 (藍綠色)
10. #F97316 (橙色)

如果使用者超過 10 人，顏色會循環使用。

