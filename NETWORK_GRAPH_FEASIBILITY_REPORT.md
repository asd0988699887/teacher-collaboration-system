# 社群網絡圖功能可行性評估報告

## 📊 評估總覽

**整體成功率：72%**

---

## 1. 功能需求分析

### 核心功能
1. **網絡圖顯示**
   - 節點：社群成員（使用者）
   - 邊（箭頭）：回覆關係（A 回覆 B，從 A 指向 B）
   - 邊的粗細：表示回覆頻率

2. **點擊互動**
   - 點擊節點顯示詳細統計：
     - 建立的總節點數
     - 回覆的節點數
     - 被回覆的節點數量

3. **統計表格**
   - 表格1：回覆過的節點統計
   - 表格2：被回覆的節點統計

---

## 2. 資料結構分析

### ✅ 現有資料完整性：**90%**

#### 可用的資料表：
1. **`ideas` 表**
   - ✅ `creator_id`：建立者ID（可用於統計建立數）
   - ✅ `parent_id`：父節點ID（可用於統計回覆關係）
   - ✅ `community_id`：社群ID（可用於過濾）

2. **`users` 表**
   - ✅ `id`：使用者ID
   - ✅ `nickname`：使用者暱稱（可用於顯示節點標籤）
   - ✅ `account`：帳號

3. **`community_members` 表**
   - ✅ `community_id`：社群ID
   - ✅ `user_id`：使用者ID（可用於確定社群成員）

### 資料統計邏輯：

#### 1. 建立的總節點數
```sql
SELECT creator_id, COUNT(*) as created_count
FROM ideas
WHERE community_id = ?
GROUP BY creator_id
```
✅ **完全可行**

#### 2. 回覆的節點數
```sql
SELECT creator_id, COUNT(*) as reply_count
FROM ideas
WHERE community_id = ? AND parent_id IS NOT NULL
GROUP BY creator_id
```
✅ **完全可行**

#### 3. 被回覆的節點數量
```sql
SELECT 
  parent_idea.creator_id as replied_to_user_id,
  COUNT(*) as received_reply_count
FROM ideas reply_idea
INNER JOIN ideas parent_idea ON reply_idea.parent_id = parent_idea.id
WHERE reply_idea.community_id = ?
GROUP BY parent_idea.creator_id
```
✅ **完全可行，需要 JOIN 查詢**

#### 4. 回覆關係（網絡圖的邊）
```sql
SELECT 
  reply_idea.creator_id as from_user_id,
  parent_idea.creator_id as to_user_id,
  COUNT(*) as reply_frequency
FROM ideas reply_idea
INNER JOIN ideas parent_idea ON reply_idea.parent_id = parent_idea.id
WHERE reply_idea.community_id = ?
GROUP BY reply_idea.creator_id, parent_idea.creator_id
HAVING from_user_id != to_user_id  -- 排除自我回覆
```
✅ **完全可行，需要 JOIN 查詢**

---

## 3. 技術實現方案

### 3.1 後端 API

**需要建立的 API：`/api/communities/[communityId]/network-graph`**

#### 返回資料結構：
```typescript
{
  nodes: [
    {
      id: string,           // 使用者ID
      label: string,        // 使用者暱稱
      createdCount: number, // 建立的節點數
      replyCount: number,   // 回覆的節點數
      receivedReplyCount: number // 被回覆的節點數
    }
  ],
  edges: [
    {
      from: string,         // 回覆者ID
      to: string,           // 被回覆者ID
      value: number,        // 回覆頻率（用於邊的粗細）
      replyCount: number    // 回覆次數
    }
  ],
  statistics: {
    totalCreated: number,   // 總建立節點數
    totalReplies: number    // 總回覆數
  }
}
```

**技術難度：中**
- 需要複雜的 JOIN 查詢
- 需要聚合統計
- 風險：低（只讀查詢，不影響資料）

### 3.2 前端視覺化

**需要安裝的圖表庫：**

#### 選項 1：react-force-graph（推薦）
- ✅ React 友好
- ✅ 支援互動（點擊、拖拽）
- ✅ 支援自定義樣式
- ✅ 文檔完善
- ⚠️ 需要額外安裝：`react-force-graph` 和 `react-force-graph-2d`

#### 選項 2：vis-network
- ✅ 功能豐富
- ✅ 支援大量節點
- ⚠️ 需要額外安裝：`vis-network` 和 `vis-data`

#### 選項 3：D3.js
- ✅ 功能最強大
- ❌ 學習曲線高
- ❌ 需要較多自定義代碼

**技術難度：中高**
- 需要學習網絡圖庫的使用
- 需要實現點擊互動
- 需要實現統計表格顯示

### 3.3 組件結構

```
CommunityNetworkGraph.tsx
├── 網絡圖區域（左側）
│   └── 使用 react-force-graph 或 vis-network
└── 統計表格區域（右側）
    ├── 表格1：回覆過的節點統計
    └── 表格2：被回覆的節點統計
```

---

## 4. 成功率評估

### 整體成功率：**72%**

### 各階段成功率：

| 階段 | 功能 | 成功率 | 風險 | 時間 |
|------|------|--------|------|------|
| 1 | 資料統計 API | 85% | 低 | 2-3小時 |
| 2 | 網絡圖基本顯示 | 75% | 中 | 4-5小時 |
| 3 | 點擊互動功能 | 70% | 中 | 2-3小時 |
| 4 | 統計表格顯示 | 80% | 低 | 2小時 |
| 5 | 樣式優化 | 90% | 低 | 2小時 |

### 主要挑戰：

1. **網絡圖庫選擇和學習**
   - 需要選擇適合的庫
   - 需要學習 API 使用
   - 風險：中

2. **大量節點的效能**
   - 如果社群成員很多，網絡圖可能複雜
   - 需要優化渲染
   - 風險：中低

3. **點擊互動的實現**
   - 需要處理節點點擊事件
   - 需要顯示彈窗或側邊欄
   - 風險：中

---

## 5. 實現步驟建議

### 階段 1：資料統計 API（優先）
1. 建立 API：`/api/communities/[communityId]/network-graph`
2. 實現節點統計（建立數、回覆數、被回覆數）
3. 實現邊的統計（回覆關係）
4. 測試 API 返回資料

**成功率：85%**
**時間：2-3 小時**

### 階段 2：網絡圖基本顯示
1. 安裝圖表庫（react-force-graph）
2. 建立組件：`CommunityNetworkGraph.tsx`
3. 顯示節點和邊
4. 基本樣式調整

**成功率：75%**
**時間：4-5 小時**

### 階段 3：點擊互動功能
1. 實現節點點擊事件
2. 顯示統計數據彈窗或側邊欄
3. 實現表格顯示

**成功率：70%**
**時間：2-3 小時**

### 階段 4：樣式優化和測試
1. 調整節點大小和顏色
2. 調整邊的粗細
3. 優化布局
4. 測試各種情況

**成功率：90%**
**時間：2 小時**

---

## 6. 風險評估

### 低風險：
- ✅ 資料統計 API（只讀查詢）
- ✅ 統計表格顯示（簡單 UI）

### 中風險：
- ⚠️ 網絡圖庫的選擇和學習
- ⚠️ 點擊互動的實現
- ⚠️ 大量節點的效能

### 高風險：
- ❌ 無明顯高風險項目

---

## 7. 回滾方案

### 如果系統無法啟動：

1. **移除新創建的文件**
   - `app/api/communities/[communityId]/network-graph/route.ts`
   - `app/components/CommunityNetworkGraph.tsx`

2. **恢復 CommunityDetail.tsx**
   - 將活動歷程中的網絡圖部分恢復為「功能開發中」提示

3. **卸載圖表庫**
   ```bash
   npm uninstall react-force-graph react-force-graph-2d
   ```

4. **重新啟動系統**

### 回滾難度：**低**
- 新增的文件獨立，不影響現有功能
- 可以快速移除

---

## 8. 推薦的實現策略

### 建議分階段實施：

1. **第一階段**：實現資料統計 API
   - 驗證資料統計邏輯正確性
   - 低風險，高成功率

2. **第二階段**：實現基本網絡圖
   - 先顯示簡單的網絡圖
   - 驗證圖表庫的可用性

3. **第三階段**：添加互動功能
   - 實現點擊顯示統計
   - 實現表格顯示

4. **第四階段**：優化和測試
   - 調整樣式
   - 效能優化
   - 完整測試

---

## 9. 結論

### 可行性：**可行（72% 成功率）**

### 優勢：
- ✅ 資料結構完整，可以統計所有需要的數據
- ✅ 現有 API 基礎良好
- ✅ 有成熟的圖表庫可用

### 挑戰：
- ⚠️ 需要學習新的圖表庫
- ⚠️ 點擊互動實現需要一定技術水平
- ⚠️ 大量節點時可能需要效能優化

### 建議：
- ✅ **可以實施**
- ✅ 分階段進行，降低風險
- ✅ 先實現資料統計 API，驗證可行性
- ✅ 選擇 react-force-graph 作為圖表庫（React 友好，易用）

---

## 10. 需要的依賴

### 推薦安裝：
```bash
npm install react-force-graph
```

### 或使用 vis-network：
```bash
npm install vis-network vis-data
```

---

## 📝 備註

- 所有更改都會確保系統穩定性
- 提供完整的回滾方案
- 分階段實施，降低風險
- 每階段完成後測試系統穩定性
- 優先實現資料統計 API，驗證資料準確性

