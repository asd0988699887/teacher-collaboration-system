'use client'

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react'

interface ZoomableIdeasContainerProps {
  children: ReactNode
  containerId: string
  communityId?: string // 保留介面相容性，不再儲存視圖狀態
  onScrollInfoChange?: (info: {
    scrollLeft: number
    scrollWidth: number
    clientWidth: number
    hasHorizontalScroll: boolean
  }) => void
}

/**
 * 想法牆畫布容器（固定縮放 = 1）
 *
 * - 禁用滾輪縮放、觸控 pinch zoom、雙擊縮放
 * - 改用 overflow:auto 原生捲動，節點不再因 zoom 飄移
 * - 四周保留 80px 安全邊距，節點不會被切到邊界
 * - 進入時捲動到 (0,0)，左上方節點以安全距離顯示
 */

const PADDING = 80 // 四周安全邊距（px）

export default function ZoomableIdeasContainer({
  children,
  containerId,
  onScrollInfoChange,
}: ZoomableIdeasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [contentBounds, setContentBounds] = useState({ width: 0, height: 0, minX: 0, minY: 0 })
  const prevBoundsRef = useRef({ width: 0, height: 0, minX: 0, minY: 0 })
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ── 計算所有 idea-card 的邊界 ────────────────────────────────
  const calculateBounds = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const cards = container.querySelectorAll('[id^="idea-card-"]')
    if (cards.length === 0) {
      const zero = { width: 0, height: 0, minX: 0, minY: 0 }
      if (prevBoundsRef.current.width !== 0 || prevBoundsRef.current.height !== 0) {
        setContentBounds(zero)
        prevBoundsRef.current = zero
      }
      return
    }
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

    cards.forEach((card) => {
      const el = card as HTMLElement
      const left = parseFloat(el.style.left || '0')
      const top  = parseFloat(el.style.top  || '0')
      const w = el.offsetWidth  || 160
      const h = el.offsetHeight || 100
      minX = Math.min(minX, left)
      maxX = Math.max(maxX, left + w)
      minY = Math.min(minY, top)
      maxY = Math.max(maxY, top + h)
    })

    const newBounds = {
      width : maxX - minX + PADDING * 2,
      height: maxY - minY + PADDING * 2,
      minX  : minX === Infinity ? 0 : minX,
      minY  : minY === Infinity ? 0 : minY,
    }

    // 只在有明顯變化時更新，避免不必要的 re-render
    if (
      Math.abs(prevBoundsRef.current.width  - newBounds.width)  > 1 ||
      Math.abs(prevBoundsRef.current.height - newBounds.height) > 1 ||
      Math.abs(prevBoundsRef.current.minX   - newBounds.minX)   > 1 ||
      Math.abs(prevBoundsRef.current.minY   - newBounds.minY)   > 1
      ) {
        setContentBounds(newBounds)
        prevBoundsRef.current = newBounds
      }
  }, [])

  // 初始計算 + 每秒 debounce 更新（節點拖曳後重算）
  useEffect(() => {
    const timer = setTimeout(calculateBounds, 200)
    const interval = setInterval(() => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = setTimeout(calculateBounds, 500)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [calculateBounds, children])

  // ── 禁用 Ctrl+滾輪（瀏覽器縮放），允許普通滾動 ──────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault() // 阻止 Ctrl+scroll 縮放
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [])

  // ── 通知父層捲動資訊 ──────────────────────────────────────────
  const prevScrollInfoRef = useRef<{
    scrollLeft: number; scrollWidth: number; clientWidth: number; hasHorizontalScroll: boolean
  } | null>(null)
  const scrollInfoTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !onScrollInfoChange) return

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      const hasHorizontalScroll = scrollWidth > clientWidth + 5
      const info = { scrollLeft, scrollWidth, clientWidth, hasHorizontalScroll }
      const prev = prevScrollInfoRef.current
      if (
        !prev ||
        prev.hasHorizontalScroll !== info.hasHorizontalScroll ||
        Math.abs((prev.scrollLeft || 0) - info.scrollLeft) > 20
      ) {
        prevScrollInfoRef.current = info
        onScrollInfoChange(info)
      }
    }

    const debounced = () => {
      if (scrollInfoTimerRef.current) clearTimeout(scrollInfoTimerRef.current)
      scrollInfoTimerRef.current = setTimeout(update, 300)
    }

    update()
    container.addEventListener('scroll', debounced, { passive: true })
    return () => {
      container.removeEventListener('scroll', debounced)
      if (scrollInfoTimerRef.current) clearTimeout(scrollInfoTimerRef.current)
    }
  }, [onScrollInfoChange])

  const hasContent = contentBounds.width > 0

  return (
    <div
      ref={containerRef}
      id={containerId}
      style={{
        position: 'relative',
        minHeight: '600px',
        width: '100%',
        height: '100%',
        overflow: 'auto',           // 原生捲動，取代 zoom+pan transform
        touchAction: 'pan-x pan-y', // 允許捲動、禁用 pinch-zoom
      }}
    >
      {/*
       * 畫布大小 = 所有節點邊界 + PADDING*2
       * offset wrapper 讓最左/最上節點距邊 PADDING px，確保節點不被切到
       */}
      <div
        style={{
          position: 'relative',
          width   : hasContent ? `${contentBounds.width}px`  : '100%',
          height  : hasContent ? `${contentBounds.height}px` : '100%',
          minWidth : '100%',
          minHeight: '600px',
        }}
      >
        {hasContent ? (
          <div
            style={{
              position     : 'absolute',
              left         : 0,
              top          : 0,
              width        : '100%',
              height       : '100%',
              // 把最小座標平移到 PADDING 位置，確保四周安全邊距
              transform    : `translate(${PADDING - contentBounds.minX}px, ${PADDING - contentBounds.minY}px)`,
              transformOrigin: '0 0',
        }}
      >
        {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
