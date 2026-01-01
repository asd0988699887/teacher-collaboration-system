# 回滾：活動卡片顯示建立者資訊

如果修改失敗，請按照以下步驟回滾：

## 回滾步驟

### 1. 還原 Activity interface

還原 `app/components/CommunityDetail.tsx` 中的 Activity interface：

```typescript
interface Activity {
  id: string
  name: string
  introduction: string
  createdDate: string
  createdTime: string
  isPublic: boolean
  password: string
}
```

移除 `creatorId?: string` 和 `creatorName?: string`。

### 2. 還原 ActivityCard props

還原 `app/components/ActivityCard.tsx` 中的 interface：

```typescript
interface ActivityCardProps {
  activityName: string
  introduction: string
  createdDate: string
  createdTime: string
  password?: string
  isPasswordVerified?: boolean
  onEdit?: () => void
  onManageVersion?: () => void
  onDelete?: () => void
  onCardClick?: () => void
  onRequestPassword?: (action: 'edit' | 'view' | 'menu') => void
  onPasswordVerified?: () => void
}
```

移除 `creatorId?: string` 和 `creatorName?: string`。

### 3. 還原 ActivityCard 組件

還原 `app/components/ActivityCard.tsx` 中的顯示部分：

```typescript
{/* 活動介紹 */}
<p className="text-sm text-gray-700 mb-2 mt-2">
  {introduction || '（無活動介紹）'}
</p>

{/* 建立日期時間 */}
<p className="text-sm text-gray-500">
  {createdDate} {createdTime}
</p>
```

移除建立者顯示的 div 和 getUserColor 相關代碼。

### 4. 還原 CommunityDetail 中的傳遞

還原 `app/components/CommunityDetail.tsx` 中的 ActivityCard 調用，移除 `creatorId` 和 `creatorName` props。

### 5. 還原 API（可選）

如果需要，還原 `app/api/communities/[communityId]/activities/route.ts` 中的 `creatorId` 欄位（但保留 `creatorName` 不會影響系統，因為前端不使用）。

## 備註

回滾後，活動卡片將不再顯示建立者資訊。

