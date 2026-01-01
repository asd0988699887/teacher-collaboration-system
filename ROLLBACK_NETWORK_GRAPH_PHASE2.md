# 社群網絡圖 Phase 2 回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：移除新創建的文件

刪除以下文件：
- `app/components/NetworkGraph.tsx`

### 步驟 2：恢復 CommunityDetail.tsx

在 `app/components/CommunityDetail.tsx` 文件中：

1. **移除導入語句**（約第 19 行）：
   ```typescript
   // 移除這行：
   import NetworkGraph from './NetworkGraph'
   ```

2. **恢復佔位訊息**（約第 2321-2347 行）：
   ```typescript
   {activeHistoryChart === 'network' && (
     communityId ? (
       <NetworkGraph communityId={communityId} />
     ) : (
       <div className="flex items-center justify-center h-96 text-gray-400">
         <p className="text-lg">載入中...</p>
       </div>
     )
   )}
   ```
   替換為：
   ```typescript
   {activeHistoryChart === 'network' && (
     <div className="flex flex-col items-center justify-center h-96 text-gray-400">
       <p className="text-lg mb-4">社群網絡圖功能開發中</p>
       {communityId && (
         <button
           onClick={async () => {
             try {
               console.log('測試網絡圖 API，communityId:', communityId)
               const response = await fetch(`/api/communities/${communityId}/network-graph`)
               const data = await response.json()
               console.log('網絡圖 API 返回資料:', data)
               if (response.ok) {
                 alert(`API 測試成功！\n節點數：${data.nodes?.length || 0}\n邊數：${data.edges?.length || 0}\n詳細資料請查看控制台`)
               } else {
                 alert(`API 測試失敗：${data.error || '未知錯誤'}`)
               }
             } catch (error: any) {
               console.error('API 測試錯誤:', error)
               alert(`API 測試錯誤：${error.message}`)
             }
           }}
           className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
         >
           測試 API（查看控制台）
         </button>
       )}
     </div>
   )}
   ```

### 步驟 3：清除 Next.js 快取（可選）

```bash
# Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步驟 4：重新啟動系統

```bash
npm run dev
```

## 注意事項

- 此回滾不會影響資料庫資料
- Phase 1 的 API (`/api/communities/[communityId]/network-graph`) 會保留
- 只會移除前端網絡圖組件，回到測試 API 的狀態

## 修改摘要

### 新增的功能：
- 網絡圖組件：`NetworkGraph.tsx`
- 使用 `react-force-graph-2d` 顯示網絡圖
- 點擊節點顯示詳細統計面板
- 顯示兩個統計表格（回覆過的節點、被回覆的節點）

### 修改的文件：
- `app/components/NetworkGraph.tsx`（新文件）
- `app/components/CommunityDetail.tsx`（添加導入和使用組件）

### 功能特點：

- ✅ 動態導入 ForceGraph2D，避免 SSR 問題
- ✅ 響應式容器大小調整
- ✅ 節點顏色根據活躍度變化
- ✅ 節點大小根據總互動數調整
- ✅ 邊的粗細表示回覆頻率
- ✅ 點擊節點顯示詳細統計面板
- ✅ 顯示兩個統計表格（符合圖片 3-5-50 的設計）
- ✅ 完善的錯誤處理和載入狀態

### 技術細節：

1. **避免 SSR 問題**：
   - 使用 `dynamic` 導入 `react-force-graph-2d`
   - 設置 `ssr: false`
   - 添加載入狀態

2. **容器大小處理**：
   - 使用 `useRef` 和 `getBoundingClientRect` 獲取實際容器大小
   - 監聽窗口大小變化，自動調整
   - 設置最小高度確保圖表可見

3. **數據格式轉換**：
   - 將 API 返回的 `nodes` 和 `edges` 轉換為 `react-force-graph-2d` 需要的格式
   - `nodes` 需要 `id` 和可選的 `name`
   - `links` 需要 `source` 和 `target`（可以是 id 或對象引用）

## 常見問題排查

### 問題 1：圖表不顯示
- 檢查容器是否有明確的寬度和高度
- 檢查瀏覽器控制台是否有錯誤
- 確認 `react-force-graph-2d` 是否正確安裝

### 問題 2：節點或邊不顯示
- 檢查 API 返回的數據格式是否正確
- 確認 `nodes` 和 `edges` 陣列不為空
- 檢查數據中的 `id`、`from`、`to` 是否正確

### 問題 3：點擊節點無反應
- 檢查 `userStatistics` 是否包含該節點的資料
- 確認統計面板的顯示邏輯

## 下一步

Phase 2 完成後，如果圖表能正常顯示，可以繼續 Phase 3（優化互動）或 Phase 4（樣式優化）。

