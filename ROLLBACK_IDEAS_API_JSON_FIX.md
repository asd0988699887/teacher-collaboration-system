# 修復想法列表 API JSON 解析錯誤回滾說明

## 如果修改後系統無法啟動，請按照以下步驟回滾：

### 步驟 1：恢復 app/api/communities/[communityId]/ideas/route.ts

在 `app/api/communities/[communityId]/ideas/route.ts` 文件中：

1. **恢復 GET 請求的簡化解析邏輯**（約第 43-61 行）：
   ```typescript
   // 恢復為：
   const formattedIdeas = ideas.map((idea) => ({
     id: idea.id,
     stage: idea.stage || '',
     title: idea.title,
     content: idea.content || '',
     parentId: idea.parentId || undefined,
     position: idea.positionX !== null && idea.positionY !== null
       ? { x: parseFloat(idea.positionX), y: parseFloat(idea.positionY) }
       : undefined,
     rotation: idea.rotation ? parseFloat(idea.rotation) : 0,
     isConvergence: idea.isConvergence === 1 || idea.isConvergence === true,
     convergedIdeaIds: idea.convergedIdeaIds ? JSON.parse(idea.convergedIdeaIds) : undefined,
     createdDate: idea.createdDate
       ? new Date(idea.createdDate).toISOString().split('T')[0].replace(/-/g, '/')
       : '',
     createdTime: idea.createdTime || '',
     creatorName: idea.creatorName || '',
     creatorAccount: idea.creatorAccount || '',
   }))
   ```

2. **恢復 POST 請求的簡化解析邏輯**（約第 192 行）：
   ```typescript
   // 恢復為：
   convergedIdeaIds: newIdeas[0].convergedIdeaIds ? JSON.parse(newIdeas[0].convergedIdeaIds) : undefined,
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
數據庫中的 `converged_idea_ids` 字段包含無效的 JSON 字符串，導致 `JSON.parse()` 拋出錯誤：
- `SyntaxError: Unexpected non-whitespace character after JSON at position 1`

### 修復內容
1. **GET 請求**：添加 try-catch 錯誤處理，安全地解析 JSON
2. **POST 請求**：同樣添加錯誤處理
3. **處理各種邊界情況**：
   - 空字符串
   - 字符串 "null"
   - 無效的 JSON 格式
   - 已經是數組的情況

## 修改的文件

### 已修改的文件：
1. `app/api/communities/[communityId]/ideas/route.ts`
   - 修改 GET 請求的 JSON 解析邏輯（約第 43-81 行）
   - 修改 POST 請求的 JSON 解析邏輯（約第 192-210 行）

## 回滾後的效果

- 恢復原始的 JSON 解析邏輯
- 但如果數據庫中有無效的 JSON，可能會再次出現錯誤
- 系統應該能正常啟動和運行（前提是數據庫中沒有無效的 JSON）

## 注意事項

如果回滾後問題仍然存在，可能需要：
1. 檢查數據庫中的 `converged_idea_ids` 字段
2. 清理無效的數據
3. 或者重新應用修復（因為修復是安全的，不會破壞正常數據）

