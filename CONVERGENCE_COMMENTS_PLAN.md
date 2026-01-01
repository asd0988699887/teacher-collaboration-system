# 想法收斂討論區功能修改計劃

## 需求分析

1. **文字修改**："留言"改成"討論區"
2. **顯示留言者帳號**：目前顯示"使用者"，需改為實際帳號（如"威比胖"）
3. **留言儲存**：留言需儲存到資料庫，重開表單後仍可看到
4. **留言分階段顯示**：不同收斂階段的留言要分開儲存和顯示

## 修改計劃

### Phase 1: 資料庫設計

**新增資料表：`convergence_comments`**

```sql
CREATE TABLE IF NOT EXISTS convergence_comments (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    stage VARCHAR(50) NOT NULL COMMENT '收斂階段',
    content TEXT NOT NULL COMMENT '留言內容',
    author_id VARCHAR(36) NOT NULL COMMENT '留言者ID',
    author_account VARCHAR(50) NOT NULL COMMENT '留言者帳號（快取，避免頻繁 JOIN）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_community_stage (community_id, stage),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收斂討論區留言表';
```

### Phase 2: API 開發

**建立 API 路由：`app/api/communities/[communityId]/convergence-comments/route.ts`**

#### GET - 獲取指定階段的留言
- 路徑：`/api/communities/[communityId]/convergence-comments?stage=xxx`
- 功能：根據社群ID和階段查詢留言列表
- 返回格式：
```json
{
  "comments": [
    {
      "id": "...",
      "content": "...",
      "authorAccount": "威比胖",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

#### POST - 建立新留言
- 路徑：`/api/communities/[communityId]/convergence-comments`
- 請求格式：
```json
{
  "stage": "dd",
  "content": "留言內容",
  "authorId": "使用者ID"
}
```
- 返回格式：建立的留言資料

### Phase 3: 前端組件修改

#### 3.1 ConvergenceModal.tsx

**修改內容：**

1. **Props 擴充**：
   - 新增 `userAccount?: string` prop（從 CommunityDetail 傳入）

2. **狀態管理**：
   - 修改 `comments` 狀態結構，改為根據階段存儲：
     ```typescript
     const [commentsByStage, setCommentsByStage] = useState<Record<string, Comment[]>>({})
     ```

3. **階段選擇時載入留言**：
   - 當 `selectedStage` 改變時，調用 GET API 載入該階段的留言
   - 使用 `useEffect` 監聽 `selectedStage` 變化

4. **新增留言功能**：
   - 修改 `handleAddComment` 函數，調用 POST API 儲存留言
   - 成功後更新本地狀態

5. **文字修改**：
   - "留言" → "討論區"
   - "輸入留言..." → "輸入留言..."（保持不變）

6. **顯示留言者帳號**：
   - 使用 `comment.authorAccount` 取代硬編碼的"使用者"

#### 3.2 CommunityDetail.tsx

**修改內容：**

1. **傳遞 userAccount 給 ConvergenceModal**：
   ```typescript
   <ConvergenceModal
     ideas={ideas}
     onClose={() => setIsConvergenceModalOpen(false)}
     onSubmit={handleConvergenceSubmit}
     userAccount={userAccount}  // 新增
   />
   ```

2. **handleConvergenceSubmit 修改**（可選）：
   - 目前留言資料在 `data.comments` 中，但由於留言已透過 API 儲存，可以移除這個參數
   - 或保留但不使用（向後相容）

### Phase 4: 資料結構定義

**新增 Comment 介面：**

```typescript
interface ConvergenceComment {
  id: string
  content: string
  authorAccount: string
  createdAt: string
}
```

## 實施步驟

1. ✅ 建立資料庫表（先手動執行 SQL）
2. ✅ 建立 API 路由檔案
3. ✅ 修改 ConvergenceModal.tsx
4. ✅ 修改 CommunityDetail.tsx
5. ✅ 測試功能
6. ✅ 建立回滾計劃

## 回滾計劃

如果系統無法啟動或功能異常，可以執行以下步驟回滾：

1. **刪除 API 路由**：
   - 刪除 `app/api/communities/[communityId]/convergence-comments/route.ts`

2. **還原 ConvergenceModal.tsx**：
   - 恢復到修改前的狀態
   - 移除 `userAccount` prop
   - 恢復原本的留言狀態管理（不根據階段分組）
   - 恢復硬編碼的"使用者"

3. **還原 CommunityDetail.tsx**：
   - 移除傳遞給 ConvergenceModal 的 `userAccount` prop

4. **資料庫表保留**（可選）：
   - 可以保留 `convergence_comments` 表，不影響系統運行
   - 或執行 `DROP TABLE IF EXISTS convergence_comments;`

## 注意事項

1. **資料一致性**：`author_account` 欄位是快取欄位，如果使用者修改帳號，需要更新所有相關記錄（或改為每次都 JOIN users 表）

2. **階段名稱**：階段名稱可能包含特殊字元，API 需要使用 URL 編碼

3. **錯誤處理**：API 和前端都要有適當的錯誤處理機制

4. **效能考量**：如果留言數量很大，可以考慮分頁載入

## 成功標準

1. ✅ 文字已從"留言"改為"討論區"
2. ✅ 留言者顯示實際帳號（如"威比胖"）而非"使用者"
3. ✅ 留言可以儲存到資料庫
4. ✅ 重開表單後留言仍然顯示
5. ✅ 不同收斂階段的留言分開顯示

