# 想法貢獻圖表功能回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：移除新創建的文件

刪除以下文件：
- `app/api/communities/[communityId]/idea-stats/route.ts`
- `app/components/IdeaContributionChart.tsx`

### 步驟 2：恢復 CommunityDetail.tsx

在 `app/components/CommunityDetail.tsx` 中：

1. 移除導入語句：
   ```typescript
   import IdeaContributionChart from './IdeaContributionChart'
   ```

2. 恢復活動歷程部分為原始狀態：
   ```typescript
   {activeTab === 'history' && (
     <div className="flex items-center justify-center h-full text-gray-400">
       <p className="text-lg">活動歷程功能開發中</p>
     </div>
   )}
   ```

### 步驟 3：卸載圖表庫（可選）

如果需要完全移除，可以執行：
```bash
npm uninstall recharts
```

### 步驟 4：重新啟動系統

```bash
npm run dev
```

## 注意事項

- 此回滾不會影響資料庫資料
- 只會移除新增的功能，不會影響現有功能
- 如果系統仍有問題，請檢查終端錯誤訊息

