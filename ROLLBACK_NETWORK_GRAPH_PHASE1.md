# 社群網絡圖 Phase 1 回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：移除新創建的文件

刪除以下文件：
- `app/api/communities/[communityId]/network-graph/route.ts`

### 步驟 2：清除 Next.js 快取（可選）

如果刪除文件後仍有問題，可以清除快取：

```bash
# Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# 或使用命令提示字元
rmdir /s /q .next
```

### 步驟 3：重新啟動系統

```bash
npm run dev
```

## 注意事項

- 此回滾不會影響資料庫資料
- 只會移除新增的 API，不會影響現有功能
- 如果系統仍有問題，請檢查終端錯誤訊息

## 修改摘要

### 新增的功能：
- 網絡圖資料統計 API：`/api/communities/[communityId]/network-graph`
- 節點資料統計（成員及其建立、回覆、被回覆數量）
- 邊資料統計（回覆關係和頻率）
- 詳細統計資料（每個使用者的回覆過的節點、被回覆的節點表格）

### 修改的文件：
- `app/api/communities/[communityId]/network-graph/route.ts`（新文件）

### API 返回資料結構：

```typescript
{
  nodes: [
    {
      id: string,                    // 使用者ID
      label: string,                 // 使用者名稱（用於顯示）
      userName: string,              // 使用者名稱
      userAccount: string,           // 使用者帳號
      createdCount: number,          // 建立的節點數
      replyCount: number,            // 回覆的節點數
      receivedReplyCount: number,    // 被回覆的節點數
    }
  ],
  edges: [
    {
      from: string,                  // 回覆者的 userId
      to: string,                    // 被回覆者的 userId
      fromLabel: string,             // 回覆者名稱
      toLabel: string,               // 被回覆者名稱
      value: number,                 // 回覆頻率（用於邊的粗細）
      replyCount: number,            // 回覆次數
    }
  ],
  statistics: {
    totalCreated: number,            // 總建立節點數
    totalReplies: number,            // 總回覆數
  },
  userStatistics: {
    [userId]: {
      createdCount: number,          // 建立的節點數
      replyCount: number,            // 回覆的節點數
      receivedReplyCount: number,    // 被回覆的節點數
      replyTable: [                  // 回覆過的節點列表（按來源使用者）
        {
          userId: string,
          userName: string,
          replyCount: number,
        }
      ],
      receivedReplyTable: [          // 被回覆的節點列表（按回覆者）
        {
          userId: string,
          userName: string,
          receivedReplyCount: number,
        }
      ],
    }
  },
  communityId: string
}
```

### 功能特點：

- ✅ 統計所有社群成員作為節點
- ✅ 統計每個成員建立的節點數（parent_id IS NULL）
- ✅ 統計每個成員回覆的節點數（parent_id IS NOT NULL）
- ✅ 統計每個成員被回覆的節點數
- ✅ 統計回覆關係（邊）：誰回覆了誰，頻率多少
- ✅ 排除自我回覆（不統計回覆自己建立的節點）
- ✅ 提供詳細統計表格（用於點擊顯示）

### 資料查詢邏輯：

1. **節點統計**：
   - 建立的節點：`parent_id IS NULL OR parent_id = ''`
   - 回覆的節點：`parent_id IS NOT NULL AND parent_id != ''`

2. **邊統計**：
   - 通過 JOIN `ideas` 表找出回覆關係
   - `reply_idea.parent_id = parent_idea.id` 找出回覆關係
   - `reply_idea.creator_id != parent_idea.creator_id` 排除自我回覆

3. **詳細統計**：
   - 按使用者分組統計回覆過的節點來源
   - 按使用者分組統計被回覆的節點來源

### 測試方法：

1. 啟動系統後，在瀏覽器中訪問：
   ```
   http://localhost:3001/api/communities/{communityId}/network-graph
   ```
   將 `{communityId}` 替換為實際的社群ID

2. 查看返回的 JSON 資料，確認：
   - `nodes` 陣列包含所有成員
   - `edges` 陣列包含回覆關係
   - `userStatistics` 包含每個成員的詳細統計

### 如果 API 返回錯誤：

1. 查看終端日誌中的錯誤訊息
2. 檢查資料庫連接是否正常
3. 確認 `communityId` 是否有效
4. 檢查 `ideas` 表的資料是否存在

