# 回滾：團隊分工 Icon 修改

如果 icon 修改失敗，請按照以下步驟回滾：

## 回滾步驟

### 1. 還原 CommunityDetail.tsx 中的 icon

還原 `app/components/CommunityDetail.tsx` 中 `tab.id === 'teamwork'` 的 icon 代碼：

```typescript
{tab.id === 'teamwork' && (
  // 團隊分工圖標 - 時鐘
  <>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12 6V12L16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)}
```

### 2. 還原 CourseObjectives.tsx 中的 icon

同樣還原 `app/components/CourseObjectives.tsx` 中 `tab.id === 'teamwork'` 的 icon 代碼（使用相同的時鐘 icon）。

## 備註

回滾後，團隊分工將恢復為時鐘 icon。

