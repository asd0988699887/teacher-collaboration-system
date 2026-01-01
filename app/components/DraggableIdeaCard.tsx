'use client'

import { useState, useRef, useEffect } from 'react'
import IdeaCard from './IdeaCard'

interface DraggableIdeaCardProps {
  id: string
  index: number
  stage: string
  title: string
  createdDate: string
  createdTime: string
  creatorName?: string
  creatorAvatar?: string
  creatorId?: string // 建立者ID（用於生成顏色）
  position: { x: number; y: number }
  rotation: number
  onClick: () => void
  onPositionChange: (id: string, position: { x: number; y: number }) => void
  onRotationChange: (id: string, rotation: number) => void
  isConvergence?: boolean
}

/**
 * 可拖拉的想法卡片組件
 * 支持拖拉移動和旋轉
 */
export default function DraggableIdeaCard({
  id,
  index,
  stage,
  title,
  createdDate,
  createdTime,
  creatorName,
  creatorAvatar,
  creatorId,
  position,
  rotation,
  onClick,
  onPositionChange,
  onRotationChange,
  isConvergence,
}: DraggableIdeaCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null)
  const [mouseDownTime, setMouseDownTime] = useState<number>(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // 只處理左鍵
    
    e.preventDefault()
    e.stopPropagation()
    
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    
    setMouseDownPos({ x: e.clientX, y: e.clientY })
    setMouseDownTime(Date.now())
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDownPos) return
      
      // 計算移動距離
      const dx = e.clientX - mouseDownPos.x
      const dy = e.clientY - mouseDownPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 如果移動距離超過 5px，開始拖移
      if (!isDragging && distance > 5) {
        setIsDragging(true)
      }
      
      if (!isDragging || !cardRef.current) return

      const container = document.getElementById('ideas-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      
      // 計算新位置（相對於容器）
      let newX = e.clientX - containerRect.left - dragOffset.x
      let newY = e.clientY - containerRect.top - dragOffset.y

      // 限制卡片不能移動到邊界線上方（y 不能小於 0）
      if (newY < 0) {
        newY = 0
      }

      onPositionChange(id, { x: newX, y: newY })
    }

    const handleMouseUp = () => {
      // 如果沒有拖移，且按住時間很短，則觸發點擊事件
      if (!isDragging && mouseDownPos && Date.now() - mouseDownTime < 200) {
        onClick()
      }
      
      setIsDragging(false)
      setMouseDownPos(null)
      setMouseDownTime(0)
    }

    if (mouseDownPos) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, id, onPositionChange, mouseDownPos, mouseDownTime, onClick])

  return (
    <div
      ref={cardRef}
      id={`idea-card-${index}`}
      data-idea-index={index}
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
        zIndex: isDragging ? 100 : 2,
        cursor: isDragging ? 'grabbing' : 'pointer',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="idea-card-content">
        <IdeaCard
          stage={stage}
          title={title}
          createdDate={createdDate}
          createdTime={createdTime}
          creatorName={creatorName}
          creatorAvatar={creatorAvatar}
          creatorId={creatorId}
          onClick={() => {}} // 空函數，實際點擊由外層處理
          isConvergence={isConvergence}
        />
      </div>
    </div>
  )
}
