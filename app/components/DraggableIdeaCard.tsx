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
  const [touchDownPos, setTouchDownPos] = useState<{ x: number; y: number } | null>(null)
  const [touchDownTime, setTouchDownTime] = useState<number>(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // 獲取縮放比例的輔助函數
  const getCurrentScale = () => {
    const container = document.getElementById('ideas-container')
    let currentScale = 1
    if (container) {
      const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
      if (zoomableContainer) {
        const transform = zoomableContainer.style.transform
        const scaleMatch = transform.match(/scale\(([^)]+)\)/)
        currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
      }
    }
    return currentScale
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const container = document.getElementById('ideas-container')
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
    if (!zoomableContainer) return
    const transform = zoomableContainer.style.transform
    const scaleMatch = transform.match(/scale\(([^)]+)\)/)
    const translateMatch = transform.match(/translate\(([^)]+)\)/)
    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
    const translateValues = translateMatch ? translateMatch[1].split(',').map(v => parseFloat(v.trim())) : [0, 0]
    const translateX = translateValues[0] || 0
    const translateY = translateValues[1] || 0
    
    let wrapperOffsetX = 0
    let wrapperOffsetY = 0
    const wrapper = zoomableContainer.firstElementChild as HTMLElement | null
    if (wrapper?.style?.transform) {
      const wMatch = wrapper.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
      if (wMatch) {
        wrapperOffsetX = -(parseFloat(wMatch[1].replace('px', '').trim()) || 0)
        wrapperOffsetY = -(parseFloat(wMatch[2].replace('px', '').trim()) || 0)
      }
    }
    
    const mouseXInContainer = e.clientX - containerRect.left
    const mouseYInContainer = e.clientY - containerRect.top
    const worldX = (mouseXInContainer - translateX) / currentScale + wrapperOffsetX
    const worldY = (mouseYInContainer - translateY) / currentScale + wrapperOffsetY
    setDragOffset({ x: worldX - position.x, y: worldY - position.y })
    
    setMouseDownPos({ x: e.clientX, y: e.clientY })
    setMouseDownTime(Date.now())
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const touch = e.touches[0]
    const container = document.getElementById('ideas-container')
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
    if (!zoomableContainer) return
    const transform = zoomableContainer.style.transform
    const scaleMatch = transform.match(/scale\(([^)]+)\)/)
    const translateMatch = transform.match(/translate\(([^)]+)\)/)
    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
    const translateValues = translateMatch ? translateMatch[1].split(',').map(v => parseFloat(v.trim())) : [0, 0]
    const translateX = translateValues[0] || 0
    const translateY = translateValues[1] || 0
    
    let wrapperOffsetX = 0
    let wrapperOffsetY = 0
    const wrapper = zoomableContainer.firstElementChild as HTMLElement | null
    if (wrapper?.style?.transform) {
      const wMatch = wrapper.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
      if (wMatch) {
        wrapperOffsetX = -(parseFloat(wMatch[1].replace('px', '').trim()) || 0)
        wrapperOffsetY = -(parseFloat(wMatch[2].replace('px', '').trim()) || 0)
      }
    }
    
    const mouseXInContainer = touch.clientX - containerRect.left
    const mouseYInContainer = touch.clientY - containerRect.top
    const worldX = (mouseXInContainer - translateX) / currentScale + wrapperOffsetX
    const worldY = (mouseYInContainer - translateY) / currentScale + wrapperOffsetY
    setDragOffset({ x: worldX - position.x, y: worldY - position.y })
    
    setTouchDownPos({ x: touch.clientX, y: touch.clientY })
    setTouchDownTime(Date.now())
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
      
      // 找到縮放容器（ZoomableIdeasContainer 的內部 div）
      const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
      if (!zoomableContainer) return
      
      // 獲取當前的縮放比例和平移
      const transform = zoomableContainer.style.transform
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      const translateMatch = transform.match(/translate\(([^)]+)\)/)
      
      const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
      const translateValues = translateMatch ? translateMatch[1].split(',').map(v => parseFloat(v.trim())) : [0, 0]
      const translateX = translateValues[0] || 0
      const translateY = translateValues[1] || 0
      
      // 若有 offset wrapper（負座標可捲動），滑鼠換算出的座標要加上 wrapper 的反向偏移才是卡片座標系
      let wrapperOffsetX = 0
      let wrapperOffsetY = 0
      const wrapper = zoomableContainer.firstElementChild as HTMLElement | null
      if (wrapper?.style?.transform) {
        const wMatch = wrapper.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
        if (wMatch) {
          wrapperOffsetX = -(parseFloat(wMatch[1].replace('px', '').trim()) || 0)
          wrapperOffsetY = -(parseFloat(wMatch[2].replace('px', '').trim()) || 0)
        }
      }
      
      const mouseXInContainer = e.clientX - containerRect.left
      const mouseYInContainer = e.clientY - containerRect.top
      const innerDivX = (mouseXInContainer - translateX) / currentScale
      const innerDivY = (mouseYInContainer - translateY) / currentScale
      const worldX = innerDivX + wrapperOffsetX
      const worldY = innerDivY + wrapperOffsetY
      
      const newX = worldX - dragOffset.x
      const newY = worldY - dragOffset.y

      // 允許卡片自由移動，包括往上移動到負數位置
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

    // 處理觸控移動
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchDownPos || e.touches.length !== 1) return
      
      const touch = e.touches[0]
      
      // 計算移動距離
      const dx = touch.clientX - touchDownPos.x
      const dy = touch.clientY - touchDownPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 如果移動距離超過 5px，開始拖移
      if (!isDragging && distance > 5) {
        setIsDragging(true)
      }
      
      if (!isDragging || !cardRef.current) return

      const container = document.getElementById('ideas-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      
      // 找到縮放容器
      const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
      if (!zoomableContainer) return
      
      const transform = zoomableContainer.style.transform
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      const translateMatch = transform.match(/translate\(([^)]+)\)/)
      const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
      const translateValues = translateMatch ? translateMatch[1].split(',').map(v => parseFloat(v.trim())) : [0, 0]
      const translateX = translateValues[0] || 0
      const translateY = translateValues[1] || 0
      
      let wrapperOffsetX = 0
      let wrapperOffsetY = 0
      const wrapper = zoomableContainer.firstElementChild as HTMLElement | null
      if (wrapper?.style?.transform) {
        const wMatch = wrapper.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
        if (wMatch) {
          wrapperOffsetX = -(parseFloat(wMatch[1].replace('px', '').trim()) || 0)
          wrapperOffsetY = -(parseFloat(wMatch[2].replace('px', '').trim()) || 0)
        }
      }
      
      const touchXInContainer = touch.clientX - containerRect.left
      const touchYInContainer = touch.clientY - containerRect.top
      const innerDivX = (touchXInContainer - translateX) / currentScale
      const innerDivY = (touchYInContainer - translateY) / currentScale
      const worldX = innerDivX + wrapperOffsetX
      const worldY = innerDivY + wrapperOffsetY
      
      const newX = worldX - dragOffset.x
      const newY = worldY - dragOffset.y

      // 允許卡片自由移動，包括往上移動到負數位置
      onPositionChange(id, { x: newX, y: newY })
    }

    // 處理觸控結束
    const handleTouchEnd = () => {
      // 如果沒有拖移，且按住時間很短，則觸發點擊事件
      if (!isDragging && touchDownPos && Date.now() - touchDownTime < 200) {
        onClick()
      }
      
      setIsDragging(false)
      setTouchDownPos(null)
      setTouchDownTime(0)
    }

    if (mouseDownPos) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    if (touchDownPos) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragOffset, id, onPositionChange, mouseDownPos, mouseDownTime, onClick, touchDownPos, touchDownTime])

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
        touchAction: 'none', // 防止觸控時的默認行為（如滾動）
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
