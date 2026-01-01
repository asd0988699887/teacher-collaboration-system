# 回滾：收斂討論區功能修改

如果系統無法啟動或功能異常，請按照以下步驟回滾：

## 回滾步驟

### 1. 刪除 API 路由檔案

刪除以下檔案：
- `app/api/communities/[communityId]/convergence-comments/route.ts`

### 2. 還原 ConvergenceModal.tsx

還原 `app/components/ConvergenceModal.tsx` 到修改前的狀態：

**需要還原的內容：**
- 移除 `useEffect` import
- 移除 `ConvergenceComment` interface
- 移除 props 中的 `communityId`, `userId`, `userAccount`
- 移除 `isLoadingComments` 狀態
- 恢復原本的 `comments` 狀態管理（不使用 API）
- 恢復 `handleAddComment` 為簡單的本地狀態更新
- 將「討論區」改回「留言」
- 將 `comment.authorAccount` 改回 `comment.author`
- 移除 `useEffect` 中載入留言的邏輯
- 移除階段選擇時清空留言的邏輯

**關鍵修改點：**

1. **Props 介面還原**：
```typescript
interface ConvergenceModalProps {
  ideas: Idea[]
  onClose: () => void
  onSubmit: (data: {
    stage: string
    selectedIdeaIds: string[]
    convergenceContent: string
    comments: { content: string; author: string; createdAt: string }[]
  }) => void
}
```

2. **函數簽名還原**：
```typescript
export default function ConvergenceModal({ ideas, onClose, onSubmit }: ConvergenceModalProps) {
```

3. **狀態還原**：
```typescript
const [comments, setComments] = useState<{ content: string; author: string; createdAt: string }[]>([])
```

4. **handleAddComment 還原**：
```typescript
const handleAddComment = () => {
  if (!commentText.trim()) return
  
  const newComment = {
    content: commentText,
    author: '使用者',
    createdAt: new Date().toISOString()
  }
  
  setComments([...comments, newComment])
  setCommentText('')
}
```

5. **文字還原**：
```typescript
<label className="block text-sm font-medium text-gray-700 mb-2">
  留言
</label>
```

6. **顯示還原**：
```typescript
{comments.map((comment, index) => (
  <div key={index} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
    ...
    <span className="font-medium text-sm">{comment.author}</span>
    ...
  </div>
))}
```

7. **階段選擇還原**：
```typescript
onChange={(e) => {
  setSelectedStage(e.target.value)
  setSelectedIdeaIds(new Set()) // 清空已選擇的想法
}}
```

8. **onSubmit 還原**：
```typescript
onSubmit({
  stage: selectedStage,
  selectedIdeaIds: Array.from(selectedIdeaIds),
  convergenceContent,
  comments
})
```

### 3. 還原 CommunityDetail.tsx

還原 `app/components/CommunityDetail.tsx` 中 ConvergenceModal 的調用：

```typescript
{isConvergenceModalOpen && (
  <ConvergenceModal
    ideas={ideas}
    onClose={() => setIsConvergenceModalOpen(false)}
    onSubmit={handleConvergenceSubmit}
  />
)}
```

移除傳遞的 `communityId`, `userId`, `userAccount` props。

### 4. 資料庫表（可選）

如果需要完全移除資料庫表，執行：
```sql
USE teacher_collaboration_system;
DROP TABLE IF EXISTS convergence_comments;
```

或者使用提供的回滾 SQL 腳本：
```bash
mysql -u root -p teacher_collaboration_system < database/rollback_convergence_comments.sql
```

**注意：** 刪除資料表會導致所有已儲存的留言資料遺失。

### 5. 清除 Next.js 快取（可選）

如果回滾後仍有問題，清除 Next.js 快取：
```bash
rm -rf .next
npm run dev
```

## 驗證回滾

回滾完成後，請驗證：

1. ✅ 系統可以正常啟動（`npm run dev`）
2. ✅ 想法收斂表單可以正常開啟
3. ✅ 留言區顯示為「留言」而非「討論區」
4. ✅ 留言者顯示為「使用者」而非實際帳號
5. ✅ 新增留言功能正常（僅本地狀態，不會儲存）
6. ✅ 重開表單後留言消失（符合預期行為）

## 備註

- 如果只刪除 API 路由但不還原前端，系統可能會在嘗試載入留言時出現錯誤
- 建議完整執行所有回滾步驟以確保系統穩定
- 回滾後，之前儲存在資料庫的留言資料仍然存在，但前端無法存取

