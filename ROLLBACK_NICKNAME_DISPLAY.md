# 回滾：顯示使用者名稱而非帳號

如果修改失敗，請按照以下步驟回滾：

## 回滾步驟

### 1. 還原 API 路由

還原 `app/api/communities/[communityId]/convergence-comments/route.ts`：

**GET 方法還原：**
```typescript
comments = await query(
  `SELECT 
    id,
    content,
    author_account AS authorAccount,
    created_at AS createdAt
  FROM convergence_comments
  WHERE community_id = ? AND stage = ?
  ORDER BY created_at ASC`,
  [communityId, stage]
) as any[]
```

**POST 方法還原：**
```typescript
// 查詢留言者帳號
const users = await query(
  'SELECT account FROM users WHERE id = ?',
  [authorId]
) as any[]

const authorAccount = users[0].account || '未知使用者'

// ... INSERT 時使用 authorAccount
```

### 2. 還原前端組件

還原 `app/components/ConvergenceModal.tsx` 中的 `ConvergenceComment` interface：
```typescript
interface ConvergenceComment {
  id: string
  content: string
  authorAccount: string  // 改回 authorAccount
  createdAt: string
}
```

顯示部分不需要改變，因為都是使用 `comment.authorAccount`。

## 備註

回滾後，留言會顯示使用者帳號（如 "bbb"）而非使用者名稱（如 "威比胖"）。

