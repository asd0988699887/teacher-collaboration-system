# 網絡圖資料統計 API 回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：移除新創建的文件

刪除以下文件：
- `app/api/communities/[communityId]/network-graph/route.ts`

### 步驟 2：重新啟動系統

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
- 統計節點資料（建立的節點數、回覆數、被回覆數）
- 統計邊的資料（回覆關係和頻率）
- 統計表格資料（回覆過的節點、被回覆的節點）

### 修改的文件：
- `app/api/communities/[communityId]/network-graph/route.ts`（新文件）

### API 返回資料結構：

```typescript
{
  nodes: [
    {
      id: string,              // 使用者ID
      label: string,          // 使用者暱稱
      createdCount: number,   // 建立的節點數
      replyCount: number,     // 回覆的節點數
      receivedReplyCount: number // 被回覆的節點數
    }
  ],
  edges: [
    {
      from: string,           // 回覆者ID
      to: string,             // 被回覆者ID
      fromLabel: string,      // 回覆者暱稱
      toLabel: string,        // 被回覆者暱稱
      value: number,          // 回覆頻率（用於邊的粗細）
      replyCount: number      // 回覆次數
    }
  ],
  statistics: {
    totalCreated: number,     // 總建立節點數
    totalReplies: number      // 總回覆數
  },
  tables: {
    replyTable: [             // 回覆過的節點統計
      {
        userId: string,
        userName: string,
        replyCount: number
      }
    ],
    receivedReplyTable: [     // 被回覆的節點統計
      {
        userId: string,
        userName: string,
        receivedReplyCount: number
      }
    ]
  },
  communityId: string
}
```

