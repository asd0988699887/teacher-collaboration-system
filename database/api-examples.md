# 後端 API 權限檢查範例

本文檔提供後端 API 中實作權限檢查的範例代碼。

## 權限檢查邏輯

### 1. 社群編輯/刪除權限

```typescript
// 檢查使用者是否可以編輯/刪除社群
async function canEditCommunity(communityId: string, userId: string): Promise<boolean> {
  const query = `
    SELECT is_community_creator(?, ?) AS can_edit
  `;
  const result = await db.query(query, [communityId, userId]);
  return result[0].can_edit === 1;
}

// API 路由範例
app.put('/api/communities/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // 從認證中介軟體取得
  
  if (!(await canEditCommunity(id, userId))) {
    return res.status(403).json({ error: '無權限編輯此社群' });
  }
  
  // 執行編輯邏輯
  // ...
});
```

### 2. 活動編輯/刪除權限

```typescript
// 檢查使用者是否可以編輯/刪除活動
async function canEditActivity(activityId: string, userId: string): Promise<boolean> {
  const query = `
    SELECT is_activity_creator(?, ?) AS can_edit
  `;
  const result = await db.query(query, [activityId, userId]);
  return result[0].can_edit === 1;
}

// API 路由範例
app.put('/api/activities/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!(await canEditActivity(id, userId))) {
    return res.status(403).json({ error: '無權限編輯此活動' });
  }
  
  // 執行編輯邏輯
  // ...
});
```

### 3. 想法節點編輯/刪除權限

```typescript
// 檢查使用者是否可以編輯/刪除想法節點
async function canEditIdea(ideaId: string, userId: string): Promise<boolean> {
  const query = `
    SELECT is_idea_creator(?, ?) AS can_edit
  `;
  const result = await db.query(query, [ideaId, userId]);
  return result[0].can_edit === 1;
}

// API 路由範例
app.put('/api/ideas/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!(await canEditIdea(id, userId))) {
    return res.status(403).json({ error: '無權限編輯此想法節點' });
  }
  
  // 執行編輯邏輯
  // ...
});
```

### 4. 社群管理員權限

```typescript
// 檢查使用者是否為社群管理員
async function isCommunityAdmin(communityId: string, userId: string): Promise<boolean> {
  const query = `
    SELECT is_community_admin(?, ?) AS is_admin
  `;
  const result = await db.query(query, [communityId, userId]);
  return result[0].is_admin === 1;
}

// API 路由範例：設定成員為管理員
app.put('/api/communities/:id/members/:userId/role', async (req, res) => {
  const { id, userId: targetUserId } = req.params;
  const currentUserId = req.user.id;
  
  if (!(await isCommunityAdmin(id, currentUserId))) {
    return res.status(403).json({ error: '無權限管理成員' });
  }
  
  // 執行角色變更邏輯
  // ...
});
```

### 5. 社群成員檢查

```typescript
// 檢查使用者是否為社群成員
async function isCommunityMember(communityId: string, userId: string): Promise<boolean> {
  const query = `
    SELECT is_community_member(?, ?) AS is_member
  `;
  const result = await db.query(query, [communityId, userId]);
  return result[0].is_member === 1;
}

// API 路由範例：取得社群資源（所有成員都可以）
app.get('/api/communities/:id/resources', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!(await isCommunityMember(id, userId))) {
    return res.status(403).json({ error: '您不是此社群的成員' });
  }
  
  // 執行取得資源邏輯
  // ...
});
```

## 完整的權限檢查中介軟體範例

```typescript
// middleware/permissions.ts

import { Request, Response, NextFunction } from 'express';

// 社群編輯權限中介軟體
export const requireCommunityEditPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const canEdit = await canEditCommunity(id, userId);
  if (!canEdit) {
    return res.status(403).json({ error: '無權限編輯此社群' });
  }
  
  next();
};

// 活動編輯權限中介軟體
export const requireActivityEditPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const canEdit = await canEditActivity(id, userId);
  if (!canEdit) {
    return res.status(403).json({ error: '無權限編輯此活動' });
  }
  
  next();
};

// 想法節點編輯權限中介軟體
export const requireIdeaEditPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const canEdit = await canEditIdea(id, userId);
  if (!canEdit) {
    return res.status(403).json({ error: '無權限編輯此想法節點' });
  }
  
  next();
};

// 社群管理員權限中介軟體
export const requireCommunityAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const isAdmin = await isCommunityAdmin(id, userId);
  if (!isAdmin) {
    return res.status(403).json({ error: '無權限執行此操作' });
  }
  
  next();
};

// 社群成員權限中介軟體
export const requireCommunityMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const isMember = await isCommunityMember(id, userId);
  if (!isMember) {
    return res.status(403).json({ error: '您不是此社群的成員' });
  }
  
  next();
};
```

## 使用中介軟體的 API 路由範例

```typescript
// routes/communities.ts

import { Router } from 'express';
import {
  requireCommunityEditPermission,
  requireCommunityAdmin,
  requireCommunityMember
} from '../middleware/permissions';

const router = Router();

// 編輯社群（需要建立者權限）
router.put(
  '/:id',
  requireCommunityEditPermission,
  async (req, res) => {
    // 編輯邏輯
  }
);

// 刪除社群（需要建立者權限）
router.delete(
  '/:id',
  requireCommunityEditPermission,
  async (req, res) => {
    // 刪除邏輯
  }
);

// 取得社群資源（需要成員權限）
router.get(
  '/:id/resources',
  requireCommunityMember,
  async (req, res) => {
    // 取得資源邏輯
  }
);

// 管理成員（需要管理員權限）
router.put(
  '/:id/members/:userId/role',
  requireCommunityAdmin,
  async (req, res) => {
    // 管理成員邏輯
  }
);

export default router;
```

## 注意事項

1. **認證優先**：所有權限檢查都應該在認證檢查之後進行。

2. **錯誤訊息**：權限不足時應返回明確的錯誤訊息，但不要洩露過多系統資訊。

3. **效能考量**：權限檢查函數已經過優化，但對於高頻操作，可以考慮快取結果。

4. **日誌記錄**：建議記錄所有權限檢查失敗的情況，用於安全審計。

5. **測試**：確保所有權限檢查邏輯都有對應的單元測試和整合測試。


