'use client'

import { useEffect, useState } from 'react'

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
  type: 'extend' | 'converge' // 箭頭類型：延伸或收斂
}

/**
 * 箭頭覆蓋層組件
 * 在想法卡片上方繪製連接箭頭
 */
export default function ArrowsOverlay({ ideas }: ArrowsOverlayProps) {
  const [arrows, setArrows] = useState<Arrow[]>([])

  useEffect(() => {
    const updateArrows = () => {
      const container = document.getElementById('ideas-container')
      
      if (!container) {
        console.log('找不到容器')
        return
      }

      const containerRect = container.getBoundingClientRect()
      const newArrows: Arrow[] = []

      ideas.forEach((idea, childIndex) => {
        // 處理延伸箭頭（黑色）
        if (idea.parentId) {
          const parentIndex = ideas.findIndex((i) => i.id === idea.parentId)
          if (parentIndex >= 0) {
            const parentElement = document.getElementById(`idea-card-${parentIndex}`)
            const childElement = document.getElementById(`idea-card-${childIndex}`)

            if (parentElement && childElement) {
              const parentRect = parentElement.getBoundingClientRect()
              const childRect = childElement.getBoundingClientRect()

              const x1 = parentRect.right - containerRect.left
              const y1 = parentRect.top + parentRect.height / 2 - containerRect.top
              const x2 = childRect.left - containerRect.left
              const y2 = childRect.top + childRect.height / 2 - containerRect.top

              newArrows.push({
                x1,
                y1,
                x2,
                y2,
                id: `arrow-extend-${idea.id}`,
                type: 'extend',
              })
            }
          }
        }

        // 處理收斂箭頭（紫色）
        if (idea.isConvergence && idea.convergedIdeaIds && idea.convergedIdeaIds.length > 0) {
          const convergenceElement = document.getElementById(`idea-card-${childIndex}`)
          
          if (convergenceElement) {
            idea.convergedIdeaIds.forEach((convergedId) => {
              const convergedIndex = ideas.findIndex((i) => i.id === convergedId)
              if (convergedIndex >= 0) {
                const convergedElement = document.getElementById(`idea-card-${convergedIndex}`)
                
                if (convergedElement) {
                  const convergedRect = convergedElement.getBoundingClientRect()
                  const convergenceRect = convergenceElement.getBoundingClientRect()

                  // 從被收斂節點指向收斂結果節點
                  const x1 = convergedRect.right - containerRect.left
                  const y1 = convergedRect.top + convergedRect.height / 2 - containerRect.top
                  const x2 = convergenceRect.left - containerRect.left
                  const y2 = convergenceRect.top + convergenceRect.height / 2 - containerRect.top

                  newArrows.push({
                    x1,
                    y1,
                    x2,
                    y2,
                    id: `arrow-converge-${convergedId}-to-${idea.id}`,
                    type: 'converge',
                  })
                }
              }
            })
          }
        }
      })

      // console.log('計算出的箭頭:', newArrows) // 移除日誌，減少控制台噪音
      setArrows(newArrows)
    }

    // 延遲執行，確保 DOM 已完全渲染
    const timeoutId = setTimeout(updateArrows, 300)
    
    // 監聽拖拉事件，實時更新箭頭
    const intervalId = setInterval(updateArrows, 100)
    
    window.addEventListener('resize', updateArrows)
    
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      window.removeEventListener('resize', updateArrows)
    }
  }, [ideas])

  if (arrows.length === 0) {
    // 沒有箭頭時不顯示任何內容，也不輸出日誌
    return null
  }

  // console.log('繪製箭頭:', arrows) // 移除日誌，減少控制台噪音

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        zIndex: 1,
        width: '100%',
        height: '100%',
        minHeight: '600px',
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
          markerWidth="6"
          markerHeight="6"
          refX="6"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#9333ea" />
        </marker>
      </defs>
      {arrows.map((arrow) => (
        <line
          key={arrow.id}
          x1={arrow.x1}
          y1={arrow.y1}
          x2={arrow.x2}
          y2={arrow.y2}
          stroke={arrow.type === 'converge' ? '#9333ea' : 'black'}
          strokeWidth="2"
          markerEnd={arrow.type === 'converge' ? 'url(#arrowhead-converge)' : 'url(#arrowhead-extend)'}
        />
      ))}
    </svg>
  )
}

