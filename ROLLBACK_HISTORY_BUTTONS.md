# 活動歷程按鈕功能回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：恢復 CommunityDetail.tsx

在 `app/components/CommunityDetail.tsx` 中：

1. **移除新增的狀態變數**（約第 120 行）：
   ```typescript
   const [activeHistoryChart, setActiveHistoryChart] = useState<'contribution' | 'network' | 'trend'>('contribution') // 活動歷程圖表類型
   ```
   刪除這一行。

2. **恢復活動歷程部分的原始代碼**（約第 2207 行）：
   將以下代碼：
   ```typescript
   {activeTab === 'history' && (
     <div className="flex-1 px-8 py-6">
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
         {/* 圖表切換按鈕 */}
         <div className="flex gap-3 mb-6">
           <button
             onClick={() => setActiveHistoryChart('contribution')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               activeHistoryChart === 'contribution'
                 ? 'bg-[rgba(138,99,210,0.9)] text-white'
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             社群想法貢獻數量圖
           </button>
           <button
             onClick={() => setActiveHistoryChart('network')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               activeHistoryChart === 'network'
                 ? 'bg-[rgba(138,99,210,0.9)] text-white'
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             社群網絡圖
           </button>
           <button
             onClick={() => setActiveHistoryChart('trend')}
             className={`px-4 py-2 rounded-lg font-medium transition-colors ${
               activeHistoryChart === 'trend'
                 ? 'bg-[rgba(138,99,210,0.9)] text-white'
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
             }`}
           >
             社群想法貢獻數量變化圖表
           </button>
         </div>

         {/* 根據選中的圖表類型顯示對應內容 */}
         {communityId && (
           <div>
             {activeHistoryChart === 'contribution' && (
               <IdeaContributionChart communityId={communityId} />
             )}
             {activeHistoryChart === 'network' && (
               <div className="flex items-center justify-center h-96 text-gray-400">
                 <p className="text-lg">社群網絡圖功能開發中</p>
               </div>
             )}
             {activeHistoryChart === 'trend' && (
               <div className="flex items-center justify-center h-96 text-gray-400">
                 <p className="text-lg">社群想法貢獻數量變化圖表功能開發中</p>
               </div>
             )}
           </div>
         )}
       </div>
     </div>
   )}
   ```
   
   恢復為：
   ```typescript
   {activeTab === 'history' && (
     <div className="flex-1 px-8 py-6">
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
         {/* 標題 */}
         <h2 className="text-xl font-semibold text-gray-800 mb-6">
           活動歷程
         </h2>

         {/* 社群想法貢獻數量圖表 */}
         {communityId && (
           <div className="mb-8">
             <IdeaContributionChart communityId={communityId} />
           </div>
         )}
       </div>
     </div>
   )}
   ```

### 步驟 2：重新啟動系統

```bash
npm run dev
```

## 注意事項

- 此回滾不會影響資料庫資料
- 只會移除新增的按鈕功能，不會影響現有功能
- 如果系統仍有問題，請檢查終端錯誤訊息

## 修改摘要

### 新增的功能：
- 活動歷程頁面新增三個切換按鈕
- 按鈕可以切換顯示不同的圖表類型
- 移除原有的「活動歷程」標題

### 修改的文件：
- `app/components/CommunityDetail.tsx`

