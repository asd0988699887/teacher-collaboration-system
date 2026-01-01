'use client'

import { useDroppable } from '@dnd-kit/core'

interface DroppableListProps {
  id: string
  children: React.ReactNode
  isEmpty: boolean
}

/**
 * 可放置的列表容器
 * 確保空列表也能作為拖放目標
 */
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

