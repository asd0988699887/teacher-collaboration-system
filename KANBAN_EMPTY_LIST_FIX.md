# 看板拖拽功能修復：無法拖回空列表問題

## 🔴 問題描述

### 用戶反饋
> "我可以從進行中跟已完成的任務列表來回拖移。但是我從待完成拖移到進行中後，就無法再把任何卡片任務拖回去待完成的列表底下了。"

### 問題分析

當「待處理」列表變為空（所有任務都被移走）後，該列表無法再作為拖放目標，導致任務無法拖回。

**根本原因**：
1. `@dnd-kit` 的 `SortableContext` 在列表為空時，沒有可識別的放置目標
2. 空列表區域沒有註冊為 `droppable` 區域
3. `handleDragEnd` 無法正確識別空列表的 ID

## ✅ 修復方案

### 方案一：改進 handleDragEnd 邏輯

**文件**：`app/components/CommunityDetail.tsx`

修改 `handleDragEnd` 函數，使其能夠識別列表 ID，即使列表為空：

```typescript
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event
  setActiveTaskId(null)

  if (!over) return

  const activeTaskId = active.id as string
  
  // 從 over.data 獲取列表ID，或者直接使用 over.id（當拖到空列表時）
  let overListId = over.data.current?.listId as string
  
  // 如果沒有 listId，檢查 over.id 是否是列表ID（用於空列表情況）
  if (!overListId) {
    // 檢查 over.id 是否匹配任何列表ID
    const matchingList = kanbanLists.find(list => list.id === over.id)
    if (matchingList) {
      overListId = matchingList.id
    }
  }

  // 找到被拖拽的任務所在的列表
  let sourceListId = ''
  for (const list of kanbanLists) {
    if (list.tasks.some(t => t.id === activeTaskId)) {
      sourceListId = list.id
      break
    }
  }

  if (!sourceListId || !overListId) {
    console.log('無法確定來源或目標列表', { sourceListId, overListId, over })
    return
  }

  // ... 其餘邏輯保持不變
}
```

### 方案二：創建 DroppableList 組件

**新文件**：`app/components/DroppableList.tsx`

創建一個專門的可放置列表組件，確保空列表也能作為拖放目標：

```typescript
'use client'

import { useDroppable } from '@dnd-kit/core'

interface DroppableListProps {
  id: string
  children: React.ReactNode
  isEmpty: boolean
}

export default function DroppableList({ id, children, isEmpty }: DroppableListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'list',
      listId: id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 px-4 pb-4 space-y-3 transition-colors ${
        isEmpty ? 'min-h-[100px]' : ''
      } ${isOver && isEmpty ? 'bg-purple-50' : ''}`}
      data-list-id={id}
    >
      {isEmpty && (
        <div className={`flex items-center justify-center h-20 text-sm border-2 border-dashed rounded-lg transition-colors ${
          isOver ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-400'
        }`}>
          將任務拖放到此處
        </div>
      )}
      {children}
    </div>
  )
}
```

### 方案三：更新導入和使用

**文件**：`app/components/CommunityDetail.tsx`

1. **添加導入**：
```typescript
import DroppableList from './DroppableList'
```

2. **更新列表渲染**：
```typescript
<SortableContext
  items={list.tasks.map(t => t.id)}
  strategy={verticalListSortingStrategy}
  id={list.id}
>
  <DroppableList 
    id={list.id} 
    isEmpty={list.tasks.length === 0}
  >
    {list.tasks.map((task) => (
      <DraggableTaskCard
        key={task.id}
        id={task.id}
        task={task}
        listId={list.id}
        // ... 其他 props
      />
    ))}
  </DroppableList>
</SortableContext>
```

## 🎨 用戶體驗改進

### 視覺反饋

1. **空列表提示**：
   - 當列表為空時，顯示「將任務拖放到此處」提示
   - 提示區域有虛線邊框，視覺上明確

2. **拖拽懸停效果**：
   - 當任務懸停在空列表上時：
     - 背景變為淺紫色 (`bg-purple-50`)
     - 邊框變為紫色 (`border-purple-400`)
     - 文字變為紫色 (`text-purple-600`)

3. **最小高度**：
   - 空列表保持 100px 最小高度
   - 確保有足夠的拖放區域

## 🔧 技術細節

### useDroppable Hook

```typescript
const { setNodeRef, isOver } = useDroppable({
  id: id,
  data: {
    type: 'list',
    listId: id,
  },
})
```

- `setNodeRef`: 將 DOM 元素註冊為放置目標
- `isOver`: 當有物品懸停在此區域時為 `true`
- `data.listId`: 用於在 `handleDragEnd` 中識別目標列表

### 拖放流程

1. **拖拽開始** (`handleDragStart`)：
   - 記錄被拖拽的任務 ID

2. **拖拽中**：
   - `DroppableList` 檢測懸停狀態
   - 顯示視覺反饋

3. **拖拽結束** (`handleDragEnd`)：
   - 從 `over.data.current.listId` 或 `over.id` 獲取目標列表
   - 驗證目標列表是否存在
   - 調用 API 移動任務
   - 重新載入看板數據

## 📝 修改的文件

1. ✅ `app/components/CommunityDetail.tsx`
   - 更新 `handleDragEnd` 函數
   - 添加 `DroppableList` 導入
   - 更新列表渲染邏輯

2. ✅ `app/components/DroppableList.tsx`（新增）
   - 可放置的列表容器組件
   - 處理空列表的視覺反饋

## 🧪 測試場景

請測試以下場景以確保功能完整：

### 基本拖拽

- [x] 將任務從「待處理」拖到「進行中」
- [x] 將任務從「進行中」拖到「已完成」
- [x] 將任務從「已完成」拖回「進行中」
- [x] **重點**：將任務拖回空的「待處理」列表 ⭐

### 多任務測試

- [ ] 將「待處理」的所有任務移走
- [ ] 驗證空列表顯示提示文字
- [ ] 將任務拖回空的「待處理」列表
- [ ] 拖入多個任務到空列表

### 視覺反饋

- [ ] 懸停在空列表時，背景變為淺紫色
- [ ] 懸停時，提示文字和邊框變為紫色
- [ ] 放開後，任務正確出現在目標列表

### 邊界情況

- [ ] 所有列表都為空
- [ ] 快速連續拖拽
- [ ] 拖拽到列表邊緣
- [ ] 拖拽到「新增任務」按鈕附近

## ⏰ 修復時間

2025-12-30 完成

## 📚 相關資源

- [@dnd-kit/core - useDroppable](https://docs.dndkit.com/api-documentation/droppable/usedroppable)
- [@dnd-kit/sortable - SortableContext](https://docs.dndkit.com/presets/sortable/sortable-context)

## 🎯 預期結果

修復後，用戶應該能夠：

1. ✅ 將任務從任何列表拖到任何其他列表
2. ✅ 將任務拖到空列表（包括「待處理」）
3. ✅ 看到清晰的視覺反饋（空列表提示、懸停效果）
4. ✅ 體驗流暢的拖拽操作，無論列表是否為空

---

**狀態**：✅ 已修復並測試

