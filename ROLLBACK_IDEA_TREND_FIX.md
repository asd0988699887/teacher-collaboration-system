# 修復想法趨勢圖表資料顯示問題 - 回滾說明

## 修改內容

### 1. 修正日期格式問題
- 使用 `DATE_FORMAT(i.created_at, '%Y-%m-%d')` 確保返回的日期格式為 YYYY-MM-DD
- 在填充統計資料時，處理可能的時間戳格式轉換

### 2. 修正統計範圍
- **改為統計新增+回覆（所有想法）**，而不是只統計新增
- 移除 `parent_id IS NULL` 的條件限制

### 3. 修正調試日誌順序
- 將 `dailyStats` 的調試輸出移到定義之後

## 回滾步驟

如果修改後系統無法啟動，請按照以下步驟回滾：

### 步驟 1：還原 API 文件

```bash
git checkout app/api/communities/[communityId]/idea-trend/route.ts
```

或者手動還原以下修改：

1. **恢復查詢條件**（約第 78-90 行）：
   ```sql
   -- 改回只統計新增想法
   SELECT 
     DATE(i.created_at) AS date,
     i.creator_id AS userId,
     COUNT(*) AS createdCount
   FROM ideas i
   WHERE i.community_id = ?
     AND (i.parent_id IS NULL OR i.parent_id = '')
     AND DATE(i.created_at) >= CAST(? AS DATE)
     AND DATE(i.created_at) <= CAST(? AS DATE)
   ```

2. **移除日期格式處理**（約第 119-127 行）：
   ```typescript
   // 簡化為：
   const date = stat.date
   ```

### 步驟 2：清除 Next.js 快取（可選）

```bash
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步驟 3：重新啟動

```bash
npm run dev
```

## 修改的文件

- `app/api/communities/[communityId]/idea-trend/route.ts`

## 預期效果

修改後應該能夠：
1. 正確統計所有想法（新增+回覆）
2. 正確處理日期格式，避免匹配失敗
3. 圖表能夠正常顯示資料

