'use client'

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react'

interface ZoomableIdeasContainerProps {
  children: ReactNode
  containerId: string
  communityId?: string // 社群ID，用於儲存視圖狀態
  onScrollInfoChange?: (info: { scrollLeft: number; scrollWidth: number; clientWidth: number; hasHorizontalScroll: boolean }) => void
}

/**
 * 可縮放的想法牆容器組件
 * 支援滑鼠滾輪縮放（電腦）和手勢縮放（手機）
 */
export default function ZoomableIdeasContainer({ children, containerId, communityId, onScrollInfoChange }: ZoomableIdeasContainerProps) {
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanningRef = useRef(false)
  const lastPanPointRef = useRef({ x: 0, y: 0 })
  
  // 使用 ref 來存儲當前的 scale 和 pan，避免閉包問題
  const scaleRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  
  // 視圖狀態儲存相關
  const viewStateSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoadRef = useRef(true) // 標記是否為初始載入
  
  // 追蹤是否有內容超出邊界，用於動態顯示卷軸
  const [hasOverflow, setHasOverflow] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  // 檢測是否為觸控設備
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)
    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])
  
  // 同步 state 和 ref
  useEffect(() => {
    scaleRef.current = scale
    panRef.current = pan
  }, [scale, pan])
  
  // 保存視圖狀態的函數
  const saveViewState = useCallback(async (zoom: number, panX: number, panY: number) => {
    if (!communityId) return // 如果沒有 communityId，不保存
    
    try {
      const response = await fetch(
        `/api/communities/${communityId}/idea-wall/view-state`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ zoom, panX, panY }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('保存想法牆視圖狀態失敗:', data.error || '未知錯誤')
      } else {
        console.log('✅ 想法牆視圖狀態保存成功')
      }
    } catch (error: any) {
      console.error('保存想法牆視圖狀態錯誤:', error)
    }
  }, [communityId])
  
  // 載入視圖狀態
  useEffect(() => {
    const loadViewState = async () => {
      if (!communityId || !isInitialLoadRef.current) return
      
      try {
        const response = await fetch(
          `/api/communities/${communityId}/idea-wall/view-state`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.zoom !== undefined && data.panX !== undefined && data.panY !== undefined) {
            // 只有在有保存的狀態且不是默認值時才恢復
            if (data.zoom !== 1.0 || data.panX !== 0 || data.panY !== 0) {
              setScale(data.zoom)
              setPan({ x: data.panX, y: data.panY })
              scaleRef.current = data.zoom
              panRef.current = { x: data.panX, y: data.panY }
              console.log('✅ 想法牆視圖狀態恢復成功:', { zoom: data.zoom, panX: data.panX, panY: data.panY })
            }
          }
        }
      } catch (error: any) {
        console.error('載入想法牆視圖狀態錯誤:', error)
      } finally {
        isInitialLoadRef.current = false
      }
    }
    
    loadViewState()
  }, [communityId])
  
  // 當縮放或平移改變時，保存視圖狀態（使用防抖）
  useEffect(() => {
    if (isInitialLoadRef.current) return // 初始載入時不保存
    
    // 清除之前的定時器
    if (viewStateSaveTimeoutRef.current) {
      clearTimeout(viewStateSaveTimeoutRef.current)
    }
    
    // 設置新的定時器（500ms 防抖）
    viewStateSaveTimeoutRef.current = setTimeout(() => {
      saveViewState(scale, pan.x, pan.y)
    }, 500)
    
    return () => {
      if (viewStateSaveTimeoutRef.current) {
        clearTimeout(viewStateSaveTimeoutRef.current)
      }
    }
  }, [scale, pan.x, pan.y, saveViewState])
  
  // 觸控手勢相關
  const touchStartDistanceRef = useRef(0)
  const touchStartScaleRef = useRef(1)
  const touchStartPanRef = useRef({ x: 0, y: 0 })
  const touchStartCenterRef = useRef({ x: 0, y: 0 })

  // 計算兩點之間的距離
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 計算兩點的中心點
  const getCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  // 處理滑鼠滾輪縮放（電腦）
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    
    // 使用 ref 獲取最新的 scale 和 pan，避免閉包問題
    const currentScale = scaleRef.current
    const currentPan = panRef.current
    
    // 計算滑鼠位置相對於容器的座標
    // 注意：這裡要考慮容器的實際位置，包括可能的滾動
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // 計算縮放前的世界座標
    // 轉換公式：screen = world * scale + pan
    // 反向轉換：world = (screen - pan) / scale
    const worldX = (mouseX - currentPan.x) / currentScale
    const worldY = (mouseY - currentPan.y) / currentScale
    
    // 計算新的縮放比例（滾輪向上放大，向下縮小）
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(3, currentScale * zoomFactor))
    
    // 計算新的平移，使滑鼠位置對應的世界座標在縮放後仍然指向同一個螢幕位置
    // 方法1：直接計算（可能會有累積誤差）
    // newPan = mouse - world * newScale
    // 方法2：基於縮放比例變化（更穩定，避免累積誤差）
    // 計算縮放比例變化
    const scaleChange = newScale / currentScale
    // newPan = mouse - (mouse - currentPan) * scaleChange
    // 簡化：newPan = mouse * (1 - scaleChange) + currentPan * scaleChange
    const newPanX = mouseX * (1 - scaleChange) + currentPan.x * scaleChange
    const newPanY = mouseY * (1 - scaleChange) + currentPan.y * scaleChange
    
    // 同時更新 scale 和 pan，確保原子性
    setScale(newScale)
    setPan({ x: newPanX, y: newPanY })
    
    // 縮放後立即更新滾動信息，確保可以滾動
    if (onScrollInfoChange) {
      setTimeout(() => {
        const container = containerRef.current
        if (container) {
          const scrollLeft = container.scrollLeft
          const scrollWidth = container.scrollWidth
          const clientWidth = container.clientWidth
          const hasHorizontalScroll = scrollWidth > clientWidth + 10
          
          onScrollInfoChange({
            scrollLeft,
            scrollWidth,
            clientWidth,
            hasHorizontalScroll,
          })
        }
      }, 100) // 延遲 100ms 確保 DOM 已更新
    }
  }, [onScrollInfoChange])

  // 處理觸控開始（手機）
  const handleTouchStart = (e: TouchEvent) => {
    // 檢查是否點擊在想法卡片上（不應該觸發平移）
    const target = e.target as HTMLElement
    if (target.closest('.idea-card-content') || target.closest('[id^="idea-card-"]')) {
      // 如果點擊在卡片上，不處理平移，讓卡片自己處理拖曳
      return
    }
    
    if (e.touches.length === 2) {
      // 雙指捏合開始
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      touchStartDistanceRef.current = getDistance(touch1, touch2)
      touchStartScaleRef.current = scale
      touchStartPanRef.current = { ...pan }
      touchStartCenterRef.current = getCenter(touch1, touch2)
    } else if (e.touches.length === 1) {
      // 單指操作：先不設置平移模式，讓滾動優先
      const touch = e.touches[0]
      lastPanPointRef.current = { x: touch.clientX, y: touch.clientY }
      isPanningRef.current = false // 初始不阻止滾動
    }
  }

  // 處理觸控移動（手機）
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // 雙指捏合縮放
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      const currentDistance = getDistance(touch1, touch2)
      const currentCenter = getCenter(touch1, touch2)
      
      // 計算縮放比例
      const scaleChange = currentDistance / touchStartDistanceRef.current
      const newScale = Math.max(0.5, Math.min(3, touchStartScaleRef.current * scaleChange))
      
      // 計算縮放中心點相對於容器的座標
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = currentCenter.x - rect.left
      const centerY = currentCenter.y - rect.top
      
      // 計算縮放前的座標
      const worldX = (centerX - touchStartPanRef.current.x) / touchStartScaleRef.current
      const worldY = (centerY - touchStartPanRef.current.y) / touchStartScaleRef.current
      
      // 計算新的平移，使縮放中心點保持不變
      const newPanX = centerX - worldX * newScale
      const newPanY = centerY - worldY * newScale
      
      setScale(newScale)
      setPan({ x: newPanX, y: newPanY })
      
      // 縮放後立即更新滾動信息，確保可以滾動
      if (onScrollInfoChange && containerRef.current) {
        setTimeout(() => {
          const container = containerRef.current
          if (container) {
            const scrollLeft = container.scrollLeft
            const scrollWidth = container.scrollWidth
            const clientWidth = container.clientWidth
            const hasHorizontalScroll = scrollWidth > clientWidth + 10
            
            onScrollInfoChange({
              scrollLeft,
              scrollWidth,
              clientWidth,
              hasHorizontalScroll,
            })
          }
        }, 100) // 延遲 100ms 確保 DOM 已更新
      }
    } else if (e.touches.length === 1) {
      // 單指操作：優先允許原生滾動
      const touch = e.touches[0]
      const container = containerRef.current
      
      // 檢查移動距離，如果移動很小可能是滾動，如果移動很大可能是平移
      const dx = Math.abs(touch.clientX - lastPanPointRef.current.x)
      const dy = Math.abs(touch.clientY - lastPanPointRef.current.y)
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (isPanningRef.current && distance > 10) {
        // 已經在平移模式且移動距離足夠，繼續平移
        e.preventDefault()
        const moveDx = touch.clientX - lastPanPointRef.current.x
        const moveDy = touch.clientY - lastPanPointRef.current.y
        
        setPan({
          x: pan.x + moveDx,
          y: pan.y + moveDy,
        })
        
        lastPanPointRef.current = { x: touch.clientX, y: touch.clientY }
      } else if (distance > 20) {
        // 移動距離較大，切換到平移模式
        isPanningRef.current = true
        e.preventDefault()
        const moveDx = touch.clientX - lastPanPointRef.current.x
        const moveDy = touch.clientY - lastPanPointRef.current.y
        
        setPan({
          x: pan.x + moveDx,
          y: pan.y + moveDy,
        })
        
        lastPanPointRef.current = { x: touch.clientX, y: touch.clientY }
      }
      // 如果移動距離很小，不阻止默認行為，允許原生滾動
    }
  }

  // 處理觸控結束（手機）
  const handleTouchEnd = () => {
    isPanningRef.current = false
    touchStartDistanceRef.current = 0
    
    // 觸控結束後更新滾動信息
    if (onScrollInfoChange && containerRef.current) {
      setTimeout(() => {
        const container = containerRef.current
        if (container) {
          const scrollLeft = container.scrollLeft
          const scrollWidth = container.scrollWidth
          const clientWidth = container.clientWidth
          const hasHorizontalScroll = scrollWidth > clientWidth + 10
          
          onScrollInfoChange({
            scrollLeft,
            scrollWidth,
            clientWidth,
            hasHorizontalScroll,
          })
        }
      }, 100)
    }
  }

  // 處理滑鼠拖曳平移（電腦）
  const handleMouseDown = (e: MouseEvent) => {
    // 檢查是否點擊在想法卡片上（不應該觸發平移）
    const target = e.target as HTMLElement
    if (target.closest('.idea-card-content') || target.closest('[id^="idea-card-"]')) {
      // 如果點擊在卡片上，不處理平移，讓卡片自己處理拖曳
      return
    }
    
    // 只有按住中鍵或按住特定鍵（如空格）時才允許平移
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault()
      isPanningRef.current = true
      lastPanPointRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanningRef.current) {
      e.preventDefault()
      const dx = e.clientX - lastPanPointRef.current.x
      const dy = e.clientY - lastPanPointRef.current.y
      
      setPan({
        x: pan.x + dx,
        y: pan.y + dy,
      })
      
      lastPanPointRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    isPanningRef.current = false
  }

  // 計算內容區域的實際邊界（含 minX/minY 用於偏移，讓負座標節點可捲動）
  const [contentBounds, setContentBounds] = useState({ width: 0, height: 0, minX: 0, minY: 0 })
  const contentRef = useRef<HTMLDivElement>(null)
  const PADDING = 200

  // 檢測是否有卡片超出邊界
  const checkOverflow = useCallback(() => {
    const container = document.getElementById(containerId)
    if (!container) return false

    const cards = container.querySelectorAll('[id^="idea-card-"]')
    if (cards.length === 0) return false

    const containerRect = container.getBoundingClientRect()
    const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
    let currentScale = 1
    let panX = 0
    let panY = 0
    
    if (zoomableContainer) {
      const transform = zoomableContainer.style.transform
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
      
      // 獲取 pan 值
      const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
      if (translateMatch) {
        panX = parseFloat(translateMatch[1].replace('px', '').trim()) || 0
        panY = parseFloat(translateMatch[2].replace('px', '').trim()) || 0
      }
    }

    // 計算容器的實際可見範圍（考慮縮放）
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    // 檢查是否有卡片超出邊界（使用實際的螢幕座標）
    let hasOverflowX = false
    let hasOverflowY = false

    cards.forEach((card) => {
      const element = card as HTMLElement
      const cardRect = element.getBoundingClientRect()
      
      // 使用 getBoundingClientRect 獲取實際螢幕位置
      // 檢查是否超出容器的可見範圍
      if (cardRect.right > containerRect.right) {
        hasOverflowX = true
      }
      if (cardRect.bottom > containerRect.bottom) {
        hasOverflowY = true
      }
      if (cardRect.left < containerRect.left) {
        hasOverflowX = true
      }
      if (cardRect.top < containerRect.top) {
        hasOverflowY = true
      }
    })

    return hasOverflowX || hasOverflowY
  }, [containerId])

  // 使用 ref 來追蹤上一次的狀態，避免不必要的更新
  const prevOverflowRef = useRef(false)
  const prevBoundsRef = useRef({ width: 0, height: 0, minX: 0, minY: 0 })
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 計算所有想法卡片的邊界（基於 position 屬性，而非 DOM 位置）
  useEffect(() => {
    const calculateBounds = () => {
      const container = document.getElementById(containerId)
      if (!container) return

      // 找到所有想法卡片
      const cards = container.querySelectorAll('[id^="idea-card-"]')
      
      if (cards.length === 0) {
        // 如果沒有卡片，使用預設尺寸
        if (prevOverflowRef.current !== false || prevBoundsRef.current.width !== 0 || prevBoundsRef.current.height !== 0) {
          setContentBounds({ width: 0, height: 0, minX: 0, minY: 0 })
          setHasOverflow(false)
          prevOverflowRef.current = false
          prevBoundsRef.current = { width: 0, height: 0, minX: 0, minY: 0 }
        }
        return
      }

      // 有卡片時：僅在「目前有卡片超出視窗」時設為 true；不依 getBoundingClientRect 設為 false，
      // 避免拖動後暫時全在視窗內就關閉 overflow，導致畫面被壓成左上角。
      let overflow = false
      try {
        overflow = checkOverflow()
      } catch (e) {
        overflow = prevOverflowRef.current
      }
      const keepOverflowWhenHasCards = prevOverflowRef.current && cards.length > 0
      const nextOverflow = cards.length === 0 ? false : (overflow || keepOverflowWhenHasCards)
      if (prevOverflowRef.current !== nextOverflow) {
        setHasOverflow(nextOverflow)
        prevOverflowRef.current = nextOverflow
      }

      if (!nextOverflow) {
        if (prevBoundsRef.current.width !== 0 || prevBoundsRef.current.height !== 0) {
          setContentBounds({ width: 0, height: 0, minX: 0, minY: 0 })
          prevBoundsRef.current = { width: 0, height: 0, minX: 0, minY: 0 }
        }
        return
      }

      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity

      cards.forEach((card) => {
        const element = card as HTMLElement
        // 從 style 中獲取 position（不受縮放影響）
        // 使用 parseFloat 並處理負數
        const leftStr = element.style.left || ''
        const topStr = element.style.top || ''
        const left = leftStr ? parseFloat(leftStr.replace('px', '')) : 0
        const top = topStr ? parseFloat(topStr.replace('px', '')) : 0
        
        // 獲取卡片尺寸（需要考慮縮放）
        const rect = element.getBoundingClientRect()
        const zoomableContainer = container.querySelector('div[style*="transform"]') as HTMLElement
        let currentScale = 1
        if (zoomableContainer) {
          const transform = zoomableContainer.style.transform
          const scaleMatch = transform.match(/scale\(([^)]+)\)/)
          currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
        }
        
        const cardWidth = rect.width / currentScale
        const cardHeight = rect.height / currentScale
        
        // 更新邊界（包含負數位置）
        minX = Math.min(minX, left)
        maxX = Math.max(maxX, left + cardWidth)
        minY = Math.min(minY, top)
        maxY = Math.max(maxY, top + cardHeight)
      })

      // 添加邊距，確保滾動時有足夠空間
      const padding = PADDING
      
      // 確保包含負數位置（卡片可能在左邊或上方）
      const actualMinX = minX !== Infinity ? minX : 0
      const actualMaxX = maxX !== -Infinity ? maxX : 0
      const actualMinY = minY !== Infinity ? minY : 0
      const actualMaxY = maxY !== -Infinity ? maxY : 0
      
      // 計算實際需要的尺寸（包含負數位置）
      // 如果沒有卡片，使用容器尺寸
      const contentWidth = actualMaxX !== 0 || actualMinX !== 0 
        ? actualMaxX - actualMinX + padding * 2 
        : 0
      const contentHeight = actualMaxY !== 0 || actualMinY !== 0
        ? actualMaxY - actualMinY + padding * 2
        : 0
      
      // 確保內容區域至少大於容器視窗，以觸發滾動
      const containerWidth = container.clientWidth / scale
      const containerHeight = container.clientHeight / scale
      
      // 動態計算：確保內容區域有合理的尺寸
      const minContentWidth = containerWidth + padding
      const minContentHeight = containerHeight + padding
      
      const calculatedWidth = Math.max(contentWidth, minContentWidth)
      const calculatedHeight = Math.max(contentHeight, minContentHeight)

      // 只在尺寸或偏移改變時才更新（含 minX/minY 讓負座標可捲動）
      const newBounds = {
        width: calculatedWidth,
        height: calculatedHeight,
        minX: actualMinX,
        minY: actualMinY,
      }
      if (
        Math.abs(prevBoundsRef.current.width - newBounds.width) > 1 ||
        Math.abs(prevBoundsRef.current.height - newBounds.height) > 1 ||
        Math.abs(prevBoundsRef.current.minX - newBounds.minX) > 1 ||
        Math.abs(prevBoundsRef.current.minY - newBounds.minY) > 1
      ) {
        setContentBounds(newBounds)
        prevBoundsRef.current = newBounds
      }
    }

    // 使用防抖來減少更新頻率（大幅增加防抖時間）
    const debouncedCalculateBounds = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
      updateTimeoutRef.current = setTimeout(calculateBounds, 1000) // 增加到 1000ms，大幅減少更新頻率
    }

    // 延遲計算，確保 DOM 已渲染
    const timeoutId = setTimeout(calculateBounds, 200)
    
    // 定期更新邊界（當卡片移動時）- 使用更長的間隔，減少更新頻率
    const intervalId = setInterval(debouncedCalculateBounds, 1000) // 增加到 1000ms

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [containerId, scale, children, checkOverflow])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 監聽滾輪事件
    container.addEventListener('wheel', handleWheel, { passive: false })
    
    // 監聽觸控事件
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    
    // 監聽滑鼠事件（用於平移）
    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleWheel])

  // 監聽容器滾動，通知父組件卷軸狀態
  const prevScrollInfoRef = useRef<{
    scrollLeft: number
    scrollWidth: number
    clientWidth: number
    hasHorizontalScroll: boolean
  } | null>(null)
  const scrollInfoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !onScrollInfoChange) return

    const updateScrollInfo = () => {
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      // 使用更寬鬆的閾值（5px），避免在邊界值附近來回切換
      const hasHorizontalScroll = scrollWidth > clientWidth + 5

      // 只在值真正改變時才更新，避免不必要的重新渲染
      const newInfo = {
        scrollLeft,
        scrollWidth,
        clientWidth,
        hasHorizontalScroll,
      }

      const prev = prevScrollInfoRef.current
      // 使用更寬鬆的比較，避免微小變化導致更新（減少閃爍）
      const scrollLeftDiff = Math.abs((prev?.scrollLeft || 0) - newInfo.scrollLeft)
      const scrollWidthDiff = Math.abs((prev?.scrollWidth || 0) - newInfo.scrollWidth)
      const clientWidthDiff = Math.abs((prev?.clientWidth || 0) - newInfo.clientWidth)
      
      // 只在有明顯變化時才更新，特別是 hasHorizontalScroll 狀態
      const hasHorizontalScrollChanged = prev?.hasHorizontalScroll !== newInfo.hasHorizontalScroll
      
      // 使用更寬鬆的閾值，大幅減少更新頻率
      if (
        !prev ||
        (hasHorizontalScrollChanged && (scrollWidthDiff > 20 || clientWidthDiff > 20)) || // hasHorizontalScroll 變化時需要更大的閾值（20px）
        (!hasHorizontalScrollChanged && scrollLeftDiff > 20) || // 滾動超過 20px 才更新
        (!hasHorizontalScrollChanged && scrollWidthDiff > 10) || // scrollWidth 變化超過 10px
        (!hasHorizontalScrollChanged && clientWidthDiff > 10) // clientWidth 變化超過 10px
      ) {
        prevScrollInfoRef.current = newInfo
        onScrollInfoChange(newInfo)
      }
    }

    // 防抖的更新函數（使用更長的防抖時間）
    const debouncedUpdateScrollInfo = () => {
      if (scrollInfoTimeoutRef.current) {
        clearTimeout(scrollInfoTimeoutRef.current)
      }
      scrollInfoTimeoutRef.current = setTimeout(updateScrollInfo, 300) // 300ms 防抖，大幅減少閃爍
    }

    // 初始更新
    updateScrollInfo()

    // 只監聽滾動事件（移除 ResizeObserver，避免頻繁觸發）
    container.addEventListener('scroll', debouncedUpdateScrollInfo, { passive: true })
    
    // 完全移除定期檢查，只在滾動時更新，避免閃爍

    return () => {
      container.removeEventListener('scroll', debouncedUpdateScrollInfo)
      if (scrollInfoTimeoutRef.current) {
        clearTimeout(scrollInfoTimeoutRef.current)
      }
    }
  }, [onScrollInfoChange])

  // 暴露滾動控制方法給父組件
  const scrollToRef = useRef<((scrollLeft: number) => void) | null>(null)
  
  useEffect(() => {
    scrollToRef.current = (scrollLeft: number) => {
      const container = containerRef.current
      if (container) {
        container.scrollLeft = scrollLeft
      }
    }
  }, [])

  // 檢測是否為手機版（有底部導航欄）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div
      ref={containerRef}
      id={containerId}
      className="relative"
      style={{
        minHeight: '600px',
        touchAction: 'pan-x pan-y pinch-zoom', // 允許手機滾動和縮放手勢
        width: '100%',
        height: '100%',
        // 動態顯示卷軸：只有當內容超出邊界時才顯示
        // 允許水平滾動（網頁版顯示原生卷軸，手機版通過 CSS 隱藏）
        overflowX: hasOverflow ? 'auto' : 'hidden', // 允許水平滾動
        overflowY: hasOverflow ? 'auto' : 'hidden', // 保留垂直卷軸
        // 手機版優化滾動
        WebkitOverflowScrolling: hasOverflow ? 'touch' : 'auto',
        // 手機版：為底部導航欄留出空間，確保底部卷軸可見
        paddingBottom: isMobile && hasOverflow ? '80px' : '0',
      }}
    >
      <div
        ref={contentRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          // 只有在有溢出時才使用計算出的尺寸，否則使用 100% 避免觸發卷軸
          width: hasOverflow && contentBounds.width > 0 ? `${contentBounds.width}px` : '100%',
          height: hasOverflow && contentBounds.height > 0 ? `${contentBounds.height}px` : '100%',
          minWidth: hasOverflow ? 'auto' : '100%',
          minHeight: hasOverflow ? 'auto' : '100%',
          position: 'relative',
          left: 0,
          top: 0,
        }}
      >
        {/* 偏移 wrapper：讓負座標的節點落在可捲動區域內，往上拖的節點可捲回來 */}
        {hasOverflow && contentBounds.width > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              transform: `translate(${-contentBounds.minX + PADDING}px, ${-contentBounds.minY + PADDING}px)`,
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

