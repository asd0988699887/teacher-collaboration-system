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
  const [svgSize, setSvgSize] = useState({ width: '100%', height: '100%', left: 0, top: 0 })

  useEffect(() => {
    const updateArrows = () => {
      const container = document.getElementById('ideas-container')
      
      if (!container) {
        console.log('找不到容器')
        return
      }

      // 獲取縮放比例
      let scale = 1
      const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
      if (zoomableContainer) {
        const transform = zoomableContainer.style.transform
        const scaleMatch = transform.match(/scale\(([^)]+)\)/)
        scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
      }

      // 獲取卡片元素的實際尺寸（用於計算箭頭連接點）
      // 注意：由於箭頭也在縮放容器內，我們需要獲取縮放前的原始尺寸
      const getCardDimensions = (elementId: string) => {
        const element = document.getElementById(elementId)
        if (element) {
          const rect = element.getBoundingClientRect()
          // 將縮放後的尺寸轉換回縮放前的尺寸
          return { 
            width: rect.width / scale, 
            height: rect.height / scale 
          }
        }
        // 預設尺寸（如果元素還沒渲染）- 這是縮放前的尺寸
        return { width: 120, height: 80 }
      }

      // 計算所有卡片和箭頭的邊界，用於設定 SVG 尺寸
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity

      const newArrows: Arrow[] = []
      const padding = 50 // 與 ZoomableIdeasContainer 保持一致

      ideas.forEach((idea, childIndex) => {
        // 處理延伸箭頭（黑色）
        if (idea.parentId) {
          const parentIndex = ideas.findIndex((i) => i.id === idea.parentId)
          if (parentIndex >= 0) {
            const parentIdea = ideas[parentIndex]
            const childIdea = idea

            // 使用 position 屬性計算箭頭位置（不受縮放影響）
            if (parentIdea.position && childIdea.position) {
              const parentDims = getCardDimensions(`idea-card-${parentIndex}`)
              const childDims = getCardDimensions(`idea-card-${childIndex}`)

              // 箭頭起點：父卡片的右側中心
              const x1 = parentIdea.position.x + parentDims.width
              const y1 = parentIdea.position.y + parentDims.height / 2
              
              // 箭頭終點：子卡片的左側中心
              const x2 = childIdea.position.x
              const y2 = childIdea.position.y + childDims.height / 2

              // 更新邊界
              minX = Math.min(minX, x1, x2)
              maxX = Math.max(maxX, x1, x2)
              minY = Math.min(minY, y1, y2)
              maxY = Math.max(maxY, y1, y2)

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
          const convergenceIdea = idea
          
          if (convergenceIdea.position) {
            const convergenceDims = getCardDimensions(`idea-card-${childIndex}`)
            
            idea.convergedIdeaIds.forEach((convergedId) => {
              const convergedIndex = ideas.findIndex((i) => i.id === convergedId)
              if (convergedIndex >= 0) {
                const convergedIdea = ideas[convergedIndex]
                
                if (convergedIdea.position) {
                  const convergedDims = getCardDimensions(`idea-card-${convergedIndex}`)

                  // 從被收斂節點指向收斂結果節點
                  // 箭頭起點：被收斂卡片的右側中心
                  const x1 = convergedIdea.position.x + convergedDims.width
                  const y1 = convergedIdea.position.y + convergedDims.height / 2
                  
                  // 箭頭終點：收斂結果卡片的左側中心
                  const x2 = convergenceIdea.position.x
                  const y2 = convergenceIdea.position.y + convergenceDims.height / 2

                  // 更新邊界
                  minX = Math.min(minX, x1, x2)
                  maxX = Math.max(maxX, x1, x2)
                  minY = Math.min(minY, y1, y2)
                  maxY = Math.max(maxY, y1, y2)

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

        // 也計算卡片本身的邊界
        if (idea.position) {
          const cardDims = getCardDimensions(`idea-card-${childIndex}`)
          minX = Math.min(minX, idea.position.x)
          maxX = Math.max(maxX, idea.position.x + cardDims.width)
          minY = Math.min(minY, idea.position.y)
          maxY = Math.max(maxY, idea.position.y + cardDims.height)
        }
      })

      // 計算 SVG 的實際尺寸和位置（包含所有卡片和箭頭）
      const actualMinX = minX !== Infinity ? minX : 0
      const actualMaxX = maxX !== -Infinity ? maxX : 0
      const actualMinY = minY !== Infinity ? minY : 0
      const actualMaxY = maxY !== -Infinity ? maxY : 0
      
      // 計算 SVG 需要的尺寸
      const svgWidth = actualMaxX !== 0 || actualMinX !== 0
        ? actualMaxX - actualMinX + padding * 2
        : '100%'
      const svgHeight = actualMaxY !== 0 || actualMinY !== 0
        ? actualMaxY - actualMinY + padding * 2
        : '100%'
      
      // 計算 SVG 的起始位置（如果 minX 或 minY 是負數，需要調整）
      const svgLeft = actualMinX < 0 ? actualMinX - padding : 0
      const svgTop = actualMinY < 0 ? actualMinY - padding : 0
      
      // 調整箭頭座標，使其相對於 SVG 的起始位置
      const adjustedArrows = newArrows.map(arrow => ({
        ...arrow,
        x1: arrow.x1 - svgLeft,
        y1: arrow.y1 - svgTop,
        x2: arrow.x2 - svgLeft,
        y2: arrow.y2 - svgTop,
      }))
      
      // 如果計算出有效尺寸，使用像素值；否則使用百分比
      if (typeof svgWidth === 'number' && typeof svgHeight === 'number') {
        setSvgSize({
          width: `${svgWidth}px`,
          height: `${svgHeight}px`,
          left: svgLeft,
          top: svgTop,
        })
      } else {
        setSvgSize({
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
        })
      }

      setArrows(adjustedArrows)
    }

    // 延遲執行，確保 DOM 已完全渲染
    const timeoutId = setTimeout(updateArrows, 300)
    
    // 監聽拖拉事件，實時更新箭頭（增加更新頻率）
    const intervalId = setInterval(updateArrows, 50)
    
    window.addEventListener('resize', updateArrows)
    
    // 監聽卡片拖動事件
    const handleCardDrag = () => {
      updateArrows()
    }
    
    // 監聽所有想法卡片的拖動
    const cards = document.querySelectorAll('[id^="idea-card-"]')
    cards.forEach((card) => {
      card.addEventListener('mousemove', handleCardDrag)
      card.addEventListener('touchmove', handleCardDrag)
    })
    
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      window.removeEventListener('resize', updateArrows)
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleCardDrag)
        card.removeEventListener('touchmove', handleCardDrag)
      })
    }
  }, [ideas])

  if (arrows.length === 0) {
    // 沒有箭頭時不顯示任何內容，也不輸出日誌
    return null
  }

  return (
    <svg
      id="arrows-overlay-svg"
      className="absolute pointer-events-none"
      style={{
        left: `${svgSize.left}px`,
        top: `${svgSize.top}px`,
        zIndex: 1, // 低於靜態卡片（2），箭頭在卡片下方，不會遮住內容
        width: svgSize.width,
        height: svgSize.height,
        minHeight: '600px',
        // 確保 SVG 覆蓋整個內容區域
        minWidth: '100%',
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

