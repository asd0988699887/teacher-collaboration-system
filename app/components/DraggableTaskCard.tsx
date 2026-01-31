'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableTaskCardProps {
  id: string
  task: {
    id: string
    title: string
    content: string
    startDate: string
    endDate: string
    assignees: string[]
    createdAt?: string // 建立時間（ISO 字串）
  }
  listId: string
  onEdit: () => void
  onDelete: () => void
  getUserColor: (userId: string, nickname?: string) => string
  getMemberInfo: (userId: string) => { name: string; account: string }
  formatDateRange: (startDate: string, endDate: string) => string
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}

/**
 * 可拖拽的任務卡片組件
 */
export default function DraggableTaskCard({
  id,
  task,
  listId,
  onEdit,
  onDelete,
  getUserColor,
  getMemberInfo,
  formatDateRange,
  openMenuId,
  setOpenMenuId,
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
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative"
    >
      {/* 三個點選項按鈕 */}
      <div className="absolute top-2 right-2">
        <button
          type="button"
          className="task-menu-button text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setOpenMenuId(openMenuId === task.id ? null : task.id)
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="5" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="19" r="2" fill="currentColor" />
          </svg>
        </button>

        {/* 選單下拉 - 顯示在右邊 */}
        {openMenuId === task.id && (
          <div
            className="task-menu-container absolute left-full ml-2 top-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
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
              編輯任務
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
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
              刪除任務
            </button>
          </div>
        )}
      </div>

      {/* 任務類別 */}
      <h4 className="font-semibold text-gray-800 mb-1 pr-6">
        {task.title}
      </h4>

      {/* 任務內容 */}
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
        {task.content}
      </p>

      {/* 任務時間 */}
      {task.startDate || task.endDate ? (
        <div className="text-xs text-gray-500 mb-2">
          {formatDateRange(task.startDate, task.endDate)}
        </div>
      ) : null}

      {/* 底部信息 */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        {/* 任務負責人 */}
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

        {/* 顯示建立時間的相對時間 */}
        {task.createdAt && (
          <div className="text-xs text-gray-400">
            {(() => {
              const now = new Date()
              const created = new Date(task.createdAt)
              const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)

              if (diffInSeconds < 0) {
                // 如果時間差為負數（未來時間），顯示「剛剛」
                return '剛剛'
              } else if (diffInSeconds < 60) {
                return '剛剛'
              } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60)
                return `${minutes}分鐘前`
              } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600)
                return `${hours}小時前`
              } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400)
                return `${days}天前`
              } else if (diffInSeconds < 2592000) {
                const weeks = Math.floor(diffInSeconds / 604800)
                return `${weeks}週前`
              } else if (diffInSeconds < 31536000) {
                const months = Math.floor(diffInSeconds / 2592000)
                return `${months}個月前`
              } else {
                const years = Math.floor(diffInSeconds / 31536000)
                return `${years}年前`
              }
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

