'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface Idea {
  id: string
  parentId?: string
  isConvergence?: boolean
  convergedIdeaIds?: string[]
  [key: string]: any
}

interface ArrowsOverlayProps {
  ideas: Idea[]
}

interface Arrow {
  x1: number
  y1: number
  x2: number
  y2: number
  id: string
  type: 'extend' | 'converge'
}

/**
 * 箭頭覆蓋層組件
 *
 * 使用 getBoundingClientRect() 取得真實 DOM 位置，
 * 以 anchorRef（固定在 offset wrapper 左上角 0,0）為座標原點，
 * 計算「卡片視窗座標 − 錨點視窗座標」即得 SVG 本地座標。
 *
 * 優點：
 * - 不依賴 position.x/y 或 scale
 * - 捲動時 anchor 與卡片視窗座標等量變化，差值不受捲動影響
 * - 拖曳卡片時由 setInterval 每 50ms 重算，實時貼合
 */
export default function ArrowsOverlay({ ideas }: ArrowsOverlayProps) {
  const [arrows, setArrows] = useState<Arrow[]>([])
  // 座標原點錨點：position absolute, left/top=0，始終與 SVG 共享同一個 containing block
  const anchorRef = useRef<HTMLDivElement>(null)

  const updateArrows = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const anchorRect = anchor.getBoundingClientRect()

    /**
     * 取得卡片在 SVG 本地座標系的錨點。
     * x = cardViewport - anchorViewport（捲動時兩者等量抵銷）
     */
    const getPoint = (
      cardId: string,
      side: 'right' | 'left'
    ): { x: number; y: number } | null => {
      const el = document.getElementById(cardId)
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return {
        x: (side === 'right' ? rect.right : rect.left) - anchorRect.left,
        y: rect.top + rect.height / 2 - anchorRect.top,
      }
    }

    const newArrows: Arrow[] = []

    ideas.forEach((idea, childIndex) => {
      // 延伸箭頭（黑色）：parent 右緣中點 → child 左緣中點
      if (idea.parentId) {
        const parentIndex = ideas.findIndex((i) => i.id === idea.parentId)
        if (parentIndex >= 0) {
          const from = getPoint(`idea-card-${parentIndex}`, 'right')
          const to   = getPoint(`idea-card-${childIndex}`,  'left')
          if (from && to) {
            newArrows.push({
              x1: from.x, y1: from.y,
              x2: to.x,   y2: to.y,
              id: `arrow-extend-${idea.id}`,
              type: 'extend',
            })
          }
        }
      }

      // 收斂箭頭（紫色）：被收斂節點右緣中點 → 收斂結果節點左緣中點
      if (idea.isConvergence && idea.convergedIdeaIds && idea.convergedIdeaIds.length > 0) {
        idea.convergedIdeaIds.forEach((convergedId) => {
          const convergedIndex = ideas.findIndex((i) => i.id === convergedId)
          if (convergedIndex >= 0) {
            const from = getPoint(`idea-card-${convergedIndex}`, 'right')
            const to   = getPoint(`idea-card-${childIndex}`,     'left')
            if (from && to) {
              newArrows.push({
                x1: from.x, y1: from.y,
                x2: to.x,   y2: to.y,
                id: `arrow-converge-${convergedId}-to-${idea.id}`,
                type: 'converge',
              })
            }
          }
        })
      }
    })

    setArrows(newArrows)
  }, [ideas])

  // 初始化 + ideas 變更 → 重算箭頭；每 50ms interval 追蹤卡片拖曳
  useEffect(() => {
    const timer = setTimeout(updateArrows, 300)
    const interval = setInterval(updateArrows, 50)
    window.addEventListener('resize', updateArrows)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows])

  // 監聽 ideas-container 捲動（anchor 差值本身不受捲動影響，但保留以防邊緣情況）
  useEffect(() => {
    const container = document.getElementById('ideas-container')
    if (!container) return
    const onScroll = () => updateArrows()
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [updateArrows])

  return (
    <>
      {/*
       * 座標錨點：position absolute, left:0, top:0
       * 始終渲染，提供 getBoundingClientRect 的基準原點。
       * 與 SVG 同屬一個 containing block（offset wrapper），
       * 所以 card.getBoundingClientRect - anchor.getBoundingClientRect = SVG 本地座標。
       */}
      <div
        ref={anchorRef}
        aria-hidden="true"
        style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />

      {arrows.length > 0 && (
        <svg
          id="arrows-overlay-svg"
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '600px',
            overflow: 'visible', // 箭頭可超出 SVG 邊界，不被裁切
            zIndex: 1,
          }}
        >
          <defs>
            {/* 黑色箭頭（延伸關係） */}
            <marker
              id="arrowhead-extend"
              markerWidth="6"
              markerHeight="6"
              refX="6"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill="black" />
            </marker>
            {/* 紫色箭頭（收斂關係） */}
            <marker
              id="arrowhead-converge"
              markerUnits="userSpaceOnUse"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
              overflow="visible"
            >
              <path d="M 0 2 L 0 10 L 10 6 Z" fill="#7C3AED" />
            </marker>
          </defs>

          {arrows.map((arrow) => (
            <line
              key={arrow.id}
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              stroke={arrow.type === 'converge' ? '#7C3AED' : 'black'}
              strokeWidth={arrow.type === 'converge' ? '2.5' : '2'}
              markerEnd={
                arrow.type === 'converge'
                  ? 'url(#arrowhead-converge)'
                  : 'url(#arrowhead-extend)'
              }
            />
          ))}
        </svg>
      )}
    </>
  )
}
