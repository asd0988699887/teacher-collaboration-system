'use client'

import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  formatTaskDateRangeCompact,
  formatTaskDateRangeFull,
  hasTaskTime,
} from '@/lib/kanbanTaskDateTime'

export type KanbanTaskStatus = 'incomplete' | 'completed'

interface DraggableTaskCardProps {
  id: string
  task: {
    id: string
    title: string
    content: string
    startDate: string
    endDate: string
    assignees: string[]
    createdAt?: string
    status?: KanbanTaskStatus
  }
  listId: string
  readOnly?: boolean
  onEdit: () => void
  onDelete: () => void
  getUserColor: (userId: string, nickname?: string) => string
  getMemberInfo: (userId: string) => { name: string; account: string }
}

export default function DraggableTaskCard({
  id,
  task,
  listId,
  readOnly = false,
  onEdit,
  onDelete,
  getUserColor,
  getMemberInfo,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: readOnly,
    data: {
      type: 'task',
      task,
      listId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab',
  }

  const isCompleted = task.status === 'completed'
  const [isExpanded, setIsExpanded] = useState(false)
  const isCollapsed = isCompleted && !isExpanded
  const dateRangeCompact = formatTaskDateRangeCompact(task.startDate, task.endDate)
  const dateRangeFull = formatTaskDateRangeFull(task.startDate, task.endDate)
  const showFullDateOnHover =
    dateRangeFull !== '' &&
    (hasTaskTime(task.startDate) || hasTaskTime(task.endDate))

  useEffect(() => {
    if (isCompleted) {
      setIsExpanded(false)
    }
  }, [isCompleted, task.id])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(readOnly ? {} : { ...attributes, ...listeners })}
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all relative w-full min-w-0 ${
        isCollapsed
          ? 'border-green-200 bg-green-50/40 p-2'
          : 'border-gray-200 p-3'
      }`}
    >
      {isCollapsed ? (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex shrink-0 items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
            已完成
          </span>
          <h4 className="flex-1 min-w-0 text-xs font-semibold text-gray-700 truncate">{task.title}</h4>
          <button
            type="button"
            className="shrink-0 text-gray-400 hover:text-[#6D28D9] p-0.5 rounded hover:bg-white/80 transition-colors"
            title="展開任務"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(true)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      ) : (
        <>
      {/* 右上角：摺疊（已完成）/ 編輯 / 刪除 */}
      {(isCompleted || !readOnly) && (
      <div
        className="absolute top-2 right-2 flex items-center gap-0.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {isCompleted && (
          <button
            type="button"
            className="text-gray-400 hover:text-[#6D28D9] p-1 rounded hover:bg-purple-50 transition-colors"
            title="摺疊任務"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(false)
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        )}
        {!readOnly && (
          <>
        <button
          type="button"
          className="text-gray-400 hover:text-[#6D28D9] p-1 rounded hover:bg-purple-50 transition-colors"
          title="編輯任務"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
          title="刪除任務"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
          </>
        )}
      </div>
      )}

      {/* 狀態列：與右上角按鈕同高，僅此列保留右側留白 */}
      <div
        className={`mb-2 min-w-0 ${
          isCompleted || !readOnly ? 'pr-[4.5rem]' : ''
        }`}
      >
        <span
          className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isCompleted ? '已完成' : '未完成'}
        </span>
      </div>

      {/* 任務類別：在按鈕列下方，使用卡片全寬 */}
      <h4 className="font-semibold text-gray-800 mb-1 min-w-0 w-full">{task.title}</h4>

      {/* 任務內容 */}
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.content}</p>

      {/* 任務時間 */}
      {dateRangeCompact ? (
        <div
          className="text-xs text-gray-500 mb-2 cursor-default"
          title={showFullDateOnHover ? dateRangeFull : undefined}
        >
          {dateRangeCompact}
        </div>
      ) : null}

      {/* 底部信息 */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          {task.assignees.slice(0, 3).map((assigneeId) => {
            const member = getMemberInfo(assigneeId)
            return (
              <div
                key={assigneeId}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: getUserColor(assigneeId, member.name) }}
                title={member.name}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            )
          })}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {task.createdAt && (
          <div className="text-xs text-gray-400">
            {(() => {
              const now = new Date()
              const created = new Date(task.createdAt)
              const diffInSeconds = Math.floor(
                (now.getTime() - created.getTime()) / 1000
              )

              if (diffInSeconds < 0 || diffInSeconds < 60) return '剛剛'
              if (diffInSeconds < 3600) {
                return `${Math.floor(diffInSeconds / 60)}分鐘前`
              }
              if (diffInSeconds < 86400) {
                return `${Math.floor(diffInSeconds / 3600)}小時前`
              }
              if (diffInSeconds < 604800) {
                return `${Math.floor(diffInSeconds / 86400)}天前`
              }
              if (diffInSeconds < 2592000) {
                return `${Math.floor(diffInSeconds / 604800)}週前`
              }
              if (diffInSeconds < 31536000) {
                return `${Math.floor(diffInSeconds / 2592000)}個月前`
              }
              return `${Math.floor(diffInSeconds / 31536000)}年前`
            })()}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
