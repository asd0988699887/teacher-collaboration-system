# 修復更新想法 API JSON 解析錯誤回滾說明

## 如果修改後系統無法啟動，請按照以下步驟回滾：

### 步驟 1：恢復 app/api/ideas/[ideaId]/route.ts

在 `app/api/ideas/[ideaId]/route.ts` 文件中：

1. **恢復簡化的 convergedIdeaIds 解析**（約第 109-127 行）：
   ```typescript
   // 恢復為：
   const formattedIdea = {
     id: updatedIdeas[0].id,
     stage: updatedIdeas[0].stage || '',
     title: updatedIdeas[0].title,
     content: updatedIdeas[0].content || '',
     parentId: updatedIdeas[0].parentId || undefined,
     position: updatedIdeas[0].positionX !== null && updatedIdeas[0].positionY !== null
       ? { x: parseFloat(updatedIdeas[0].positionX), y: parseFloat(updatedIdeas[0].positionY) }
       : undefined,
     rotation: updatedIdeas[0].rotation ? parseFloat(updatedIdeas[0].rotation) : 0,
     isConvergence: updatedIdeas[0].isConvergence === 1 || updatedIdeas[0].isConvergence === true,
     convergedIdeaIds: updatedIdeas[0].convergedIdeaIds ? JSON.parse(updatedIdeas[0].convergedIdeaIds) : undefined,
     createdDate: updatedIdeas[0].createdDate
       ? new Date(updatedIdeas[0].createdDate).toISOString().split('T')[0].replace(/-/g, '/')
       : '',
     createdTime: updatedIdeas[0].createdTime || '',
     creatorName: updatedIdeas[0].creatorName || '',
     creatorAccount: updatedIdeas[0].creatorAccount || '',
   }
   ```

### 步驟 2：清除 Next.js 快取（可選）

```bash
# Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步驟 3：重新啟動系統

```bash
npm run dev
```

## 問題說明

### 錯誤原因
在更新想法位置時，如果想法有 `converged_idea_ids` 字段且包含無效的 JSON 字符串，會在解析時拋出錯誤，導致整個更新操作失敗，返回 "更新想法失敗"。

### 修復內容
在 PUT 請求中添加了與 GET 和 POST 請求相同的安全 JSON 解析邏輯：
- 添加 try-catch 錯誤處理
- 檢查字符串是否為空或 "null"
- 處理已經是數組的情況
- 解析失敗時設為 `undefined`，不影響其他數據

## 修改的文件

### 已修改的文件：
1. `app/api/ideas/[ideaId]/route.ts`
   - 修改 PUT 請求的 JSON 解析邏輯（約第 109-144 行）

## 預期效果

修復後：
- 更新想法位置時不會因為 JSON 解析錯誤而失敗
- 控制台不會再顯示 "更新想法位置失敗" 的錯誤訊息
- 拖移功能完全正常，無錯誤訊息

## 回滾後的效果

- 恢復原始的 JSON 解析邏輯
- 但如果想法有無效的 JSON，更新操作會失敗
- 可能會再次出現錯誤訊息

