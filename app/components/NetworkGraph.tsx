'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

// 動態導入 ForceGraph2D，避免 SSR 問題
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96 text-gray-500">載入圖表中...</div>,
})

interface NetworkNode {
  id: string
  label: string
  userName: string
  userAccount: string
  createdCount: number
  replyCount: number
  receivedReplyCount: number
}

interface NetworkEdge {
  from: string
  to: string
  fromLabel: string
  toLabel: string
  value: number
  replyCount: number
}

interface UserStatistics {
  createdCount: number
  replyCount: number
  receivedReplyCount: number
  replyTable: Array<{
    userId: string
    userName: string
    replyCount: number
  }>
  receivedReplyTable: Array<{
    userId: string
    userName: string
    receivedReplyCount: number
  }>
}

interface NetworkGraphData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  statistics: {
    totalCreated: number
    totalReplies: number
  }
  userStatistics: Record<string, UserStatistics>
  communityId: string
}

interface NetworkGraphProps {
  communityId: string
}

/**
 * 社群網絡圖組件
 * 顯示社群成員間的互動關係
 */
export default function NetworkGraph({ communityId }: NetworkGraphProps) {
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const fgRef = useRef<any>(null)
  const positionSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const viewStateSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // 追蹤所有節點的當前位置（用於保存）
  const nodesPositionRef = useRef<Map<string, { x: number; y: number; fx: number | null; fy: number | null }>>(new Map())
  // 追蹤視圖狀態（縮放比例和平移位置）
  const [viewState, setViewState] = useState({ zoom: 1.0, panX: 0, panY: 0 })
  const viewStateRef = useRef({ zoom: 1.0, panX: 0, panY: 0 })
  // 用於優化拖動性能的 requestAnimationFrame
  const dragRafRef = useRef<number | null>(null)
  
  // 檢測是否為觸控設備
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  useEffect(() => {
    // 檢測是否為觸控設備
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    setIsTouchDevice(checkTouchDevice())
  }, [])

  // 更新容器大小
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const isMobile = window.innerWidth < 640 // sm breakpoint
        // 手機上使用更大的寬度，減少被裁剪 - 使用接近全螢幕寬度
        const calculatedWidth = isMobile 
          ? Math.max(rect.width || 800, window.innerWidth * 0.98)
          : (rect.width || 800)
        setContainerSize({
          width: calculatedWidth,
          height: rect.height || 600,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // 保存視圖狀態的函數
  const saveViewState = useCallback(async (zoom: number, panX: number, panY: number) => {
    try {
      // 驗證並限制縮放比例（0.1 到 3 之間，避免太大導致跑版）
      const validZoom = Math.max(0.1, Math.min(3, zoom))
      
      // 如果縮放比例異常，不保存
      if (isNaN(zoom) || zoom < 0.1 || zoom > 3) {
        console.warn('縮放比例異常，跳過保存:', zoom)
        return
      }
      
      const response = await fetch(
        `/api/communities/${communityId}/network-graph/view-state`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ zoom: validZoom, panX, panY }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('保存視圖狀態失敗:', data.error || '未知錯誤')
      } else {
        console.log('✅ 視圖狀態保存成功')
      }
    } catch (error: any) {
      console.error('保存視圖狀態錯誤:', error)
    }
  }, [communityId])

  // 保存節點位置的函數
  const saveNodePositions = useCallback(async () => {
    if (!graphData) {
      console.warn('無法保存：graphData 為空')
      return
    }
    
    try {
      // 從 nodesPositionRef 獲取所有已追蹤的節點位置
      // 同時也從 graphData 獲取所有節點，確保所有節點都被包含
      const allNodeIds = new Set<string>()
      graphData.nodes.forEach((n) => {
        if (n.id) allNodeIds.add(n.id)
      })
      
      // 從追蹤的節點位置中獲取所有固定節點的位置
      const positions: Array<{ userId: string; x: number; y: number }> = []
      
      allNodeIds.forEach((nodeId) => {
        const trackedPos = nodesPositionRef.current.get(nodeId)
        if (trackedPos && trackedPos.fx !== null && trackedPos.fy !== null) {
          positions.push({
            userId: nodeId,
            x: trackedPos.fx,
            y: trackedPos.fy,
          })
        } else {
          // 如果節點沒有被追蹤，嘗試從 ForceGraph2D 獲取
          // 但由於無法直接訪問，我們先跳過未追蹤的節點
          console.warn('節點位置未追蹤，跳過:', nodeId)
        }
      })
      
      console.log('準備保存，節點總數:', allNodeIds.size, '已追蹤位置:', positions.length)
      
      if (positions.length === 0) {
        console.warn('沒有可保存的節點位置')
        console.log('追蹤的節點位置:', Array.from(nodesPositionRef.current.entries()))
        return
      }
      
      console.log('準備保存節點位置:', positions.length, '個節點', positions)
      
      // 保存到後端
      const response = await fetch(
        `/api/communities/${communityId}/network-graph/positions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ positions }),
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('保存節點位置失敗:', data.error || '未知錯誤', response.status, data)
        if (data.error) {
          alert(`保存失敗: ${data.error}`)
        }
      } else {
        console.log('✅ 節點位置保存成功:', data.message || '成功', `已保存 ${data.savedCount || positions.length} 個節點`)
      }
    } catch (error: any) {
      console.error('保存節點位置錯誤:', error)
      alert(`保存節點位置時發生錯誤: ${error.message || '未知錯誤'}`)
    }
  }, [graphData, communityId])

  // 載入網絡圖資料和視圖狀態
  useEffect(() => {
    const loadGraphData = async () => {
      if (!communityId) return

      setIsLoading(true)
      setError(null)

      try {
        // 同時載入圖表資料和視圖狀態
        const [graphResponse, viewStateResponse] = await Promise.all([
          fetch(`/api/communities/${communityId}/network-graph`),
          fetch(`/api/communities/${communityId}/network-graph/view-state`),
        ])

        // 檢查響應內容類型，確保是 JSON
        const graphContentType = graphResponse.headers.get('content-type')
        if (!graphContentType || !graphContentType.includes('application/json')) {
          const text = await graphResponse.text()
          console.error('網絡圖 API 返回非 JSON 響應:', text.substring(0, 200))
          throw new Error('伺服器返回了非 JSON 格式的響應，請檢查 API 端點')
        }

        const graphData = await graphResponse.json()
        
        // 檢查視圖狀態響應
        let viewStateData = { zoom: 1.0, panX: 0, panY: 0 }
        if (viewStateResponse.ok) {
          const viewStateContentType = viewStateResponse.headers.get('content-type')
          if (viewStateContentType && viewStateContentType.includes('application/json')) {
            viewStateData = await viewStateResponse.json()
          }
        }

        if (!graphResponse.ok) {
          throw new Error(graphData.error || '載入網絡圖資料失敗')
        }

        console.log('網絡圖資料載入成功:', graphData)
        setGraphData(graphData)

        // 設置視圖狀態
        if (viewStateData.zoom !== undefined) {
          const savedViewState = {
            zoom: viewStateData.zoom || 1.0,
            panX: viewStateData.panX || 0,
            panY: viewStateData.panY || 0,
          }
          setViewState(savedViewState)
          viewStateRef.current = savedViewState
        }
      } catch (err: any) {
        console.error('載入網絡圖資料錯誤:', err)
        setError(err.message || '載入網絡圖資料失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadGraphData()
  }, [communityId])

  // 設置 d3 力參數和自動縮放
  useEffect(() => {
    if (fgRef.current && graphData) {
      // 檢查是否有保存的位置
      const hasSavedPositions = graphData.nodes.some((node: any) => node.savedPosition)
      
      // 使用固定的距離（讓有連接的節點之間有足夠空間顯示箭頭）
      const dynamicLinkDistance = 80 // 固定 80px，確保箭頭清晰可見（節點半徑約15-25px，兩個節點半徑之和約30-50px）
      const dynamicChargeStrength = -40 // 固定小斥力
      
      // 延遲一點確保圖表已經初始化
      setTimeout(() => {
        if (fgRef.current) {
          try {
            // 設置連線距離（固定緊湊值）
            const linkForce = fgRef.current.d3Force('link')
            if (linkForce) {
              linkForce.distance(dynamicLinkDistance)
            }
            
            // 設置節點斥力（固定小斥力）
            const chargeForce = fgRef.current.d3Force('charge')
            if (chargeForce) {
              chargeForce.strength(dynamicChargeStrength)
            }
            
            // 添加中心力，讓節點聚集在中心（大幅增強中心力）
            const centerForce = fgRef.current.d3Force('center')
            if (centerForce) {
              centerForce.strength(0.6) // 大幅增強中心力，讓節點更聚集
            }
            
            // 如果有保存的位置，完全停止模擬（保持固定位置）
            // 如果沒有保存的位置，重新加熱模擬計算初始位置
            if (hasSavedPositions) {
              // 完全停止模擬，防止節點漂移
              try {
                const simulation = fgRef.current.d3Force('simulation')
                if (simulation) {
                  simulation.stop()
                  simulation.alpha(0) // 設置 alpha 為 0，確保模擬停止
                }
              } catch (e) {
                console.warn('停止模擬失敗:', e)
              }
            } else {
              fgRef.current.d3ReheatSimulation()
            }
          } catch (e) {
            console.error('設置 d3 力失敗:', e)
          }
        }
      }, 100)
      
      // 強制自動縮放，確保所有節點都在畫面內（避免跑版）
      // 無論是否有保存的視圖狀態，都先執行 zoomToFit 確保節點可見
      // 使用更長的延遲，確保圖表完全初始化並且節點位置已穩定
      const restoreViewStateTimeout = setTimeout(() => {
        if (fgRef.current) {
          try {
            // 先執行自動縮放，確保所有節點都在畫面內
            // 使用較大的邊距（200, 200）確保節點不會貼邊
            fgRef.current.zoomToFit(200, 200)
            console.log('✅ 已執行自動縮放，確保所有節點在畫面內')
          } catch (e) {
            console.error('自動縮放失敗:', e)
          }
        }
      }, 1500) // 等待 1.5 秒，確保圖表已完全初始化
      
      // 備用自動縮放，確保節點在畫面內（雙重保險）
      const autoFitTimeout2 = setTimeout(() => {
        if (fgRef.current) {
          try {
            // 再次執行自動縮放，確保所有節點都在畫面內
            fgRef.current.zoomToFit(200, 200)
            console.log('✅ 備用自動縮放已執行')
          } catch (e) {
            console.error('備用自動縮放失敗:', e)
          }
        }
      }, 2500) // 等待 2.5 秒，作為備用方案
      
      // 第三次自動縮放，確保節點在畫面內（三重保險）
      const autoFitTimeout3 = setTimeout(() => {
        if (fgRef.current) {
          try {
            // 最後一次執行自動縮放，確保所有節點都在畫面內
            fgRef.current.zoomToFit(200, 200)
            console.log('✅ 第三次自動縮放已執行（確保節點在畫面內）')
          } catch (e) {
            console.error('第三次自動縮放失敗:', e)
          }
        }
      }, 3500) // 等待 3.5 秒，作為最後的保險
      
      return () => {
        clearTimeout(restoreViewStateTimeout)
        clearTimeout(autoFitTimeout2)
        clearTimeout(autoFitTimeout3)
        if (positionSaveTimeoutRef.current) {
          clearTimeout(positionSaveTimeoutRef.current)
        }
        if (viewStateSaveTimeoutRef.current) {
          clearTimeout(viewStateSaveTimeoutRef.current)
        }
      }
    }
  }, [graphData, communityId])

  // 處理節點點擊
  const handleNodeClick = (node: any) => {
    if (graphData && graphData.userStatistics[node.id]) {
      setSelectedNode(node as NetworkNode)
    }
  }

  // 節點顏色（根據使用者ID生成固定顏色）
  const USER_COLORS = [
    '#8B5CF6', // 紫色
    '#3B82F6', // 藍色
    '#10B981', // 綠色
    '#FFC658', // 橙色
    '#EF4444', // 紅色
    '#00C49F', // 青色
    '#A28DFF', // 淺紫
    '#FF6F61', // 粉色
    '#66CC99', // 淺綠色
    '#FF8042', // 橘色
  ];

  const getNodeColor = (userId: string) => {
    if (!userId) return USER_COLORS[0];
    
    // 改進的 hash 函數，確保更好的顏色分布
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 轉換為 32 位整數
    }
    const index = Math.abs(hash) % USER_COLORS.length;
    return USER_COLORS[index];
  };

  // 計算節點大小（根據排名）
  const calculateNodeRadius = (node: any) => {
    // 計算文字需要的最小半徑（最後一名的基準大小）
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 10
    
    ctx.font = '3px sans-serif'
    const label = node.name || node.label || ''
    const text = `${label}\n建立: ${node.createdCount || 0}\n回覆: ${node.replyCount || 0}\n被回覆: ${node.receivedReplyCount || 0}`
    const lines = text.split('\n')
    
    // 計算每行文字的寬度
    let maxWidth = 0
    lines.forEach(line => {
      const metrics = ctx.measureText(line)
      maxWidth = Math.max(maxWidth, metrics.width)
    })
    
    // 計算總高度（行數 × 行高）
    const lineHeight = 5
    const totalHeight = lines.length * lineHeight
    
    // 計算容納文字需要的最小半徑
    const padding = 3
    const baseRadius = Math.max(maxWidth / 2, totalHeight / 2) + padding
    
    // 使用節點的排名（rank 從 1 開始，1 = 第一名）
    const rank = node.rank || 1
    const totalNodes = graphData?.nodes?.length || 1
    
    // 每高一個名次，半徑增加 1.5（直徑增加 3）- 增強排名差異視覺效果
    const radiusIncrement = 1.5
    const rankBonus = (totalNodes - rank) * radiusIncrement
    
    // 最終半徑 = 基礎半徑（文字需要的） + 排名獎勵
    return baseRadius + rankBonus
  }

  // 自定義節點繪製
  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name || node.label || '未知使用者'
    const lines = [
      label,
      `建立: ${node.createdCount || 0}`,
      `回覆: ${node.replyCount || 0}`,
      `被回覆: ${node.receivedReplyCount || 0}`
    ]
    
    // 設置文字樣式 - 更小字體
    const fontSize = 3
    ctx.font = `${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 計算每行文字的寬度
    let maxWidth = 0
    lines.forEach(line => {
      const metrics = ctx.measureText(line)
      if (metrics.width > maxWidth) {
        maxWidth = metrics.width
      }
    })
    
    // 計算總高度 - 更小行高
    const lineHeight = 5
    const totalTextHeight = lines.length * lineHeight
    
    // 計算容納文字需要的最小半徑（最後一名的基準大小）
    const padding = 3
    const baseRadius = Math.max(maxWidth / 2, totalTextHeight / 2) + padding
    
    // 節點半徑 - 根據排名增加
    const rank = node.rank || 1
    const totalNodes = graphData?.nodes?.length || 1
    const radiusIncrement = 1.5 // 每高一名次，半徑 +1.5（直徑 +3）- 增強排名差異視覺效果
    const rankBonus = (totalNodes - rank) * radiusIncrement
    const radius = baseRadius + rankBonus
    
    // 1. 繪製圓形節點
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
    // 使用節點的 userId 或 id 來生成顏色，確保每個用戶有唯一顏色
    const nodeIdForColor = node.userId || node.userAccount || node.id || ''
    ctx.fillStyle = getNodeColor(nodeIdForColor)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // 2. 繪製文字在球體內部（居中）
    const textStartY = node.y - totalTextHeight / 2 + lineHeight / 2
    
    lines.forEach((line, index) => {
      const y = textStartY + index * lineHeight
      
      // 繪製文字（不需要背景，直接顯示在球體內）
      ctx.fillStyle = '#ffffff' // 白色文字以便在彩色球體上可見
      ctx.font = `${index === 0 ? 'bold ' : ''}${fontSize}px Arial, sans-serif`
      ctx.fillText(line, node.x, y)
    })
  }

  // 載入狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>載入中...</p>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        <p>錯誤：{error}</p>
      </div>
    )
  }

  // 沒有資料
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>目前沒有網絡關係資料</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col sm:flex-row overflow-x-visible overflow-y-hidden">
      {/* 左側：網絡圖 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-x-visible overflow-y-hidden min-w-0 w-full"
        style={{ 
          minHeight: '400px', 
          height: '400px',
          touchAction: isTouchDevice ? 'pan-x pan-y pinch-zoom' : 'auto', // 手機上允許平移和縮放，桌面保持預設
          position: 'relative', // 確保負 margin 生效
          marginLeft: isTouchDevice ? '-2vw' : '0', // 手機上使用更大的負 margin 擴展顯示區域
          marginRight: isTouchDevice ? '-2vw' : '0', // 手機上使用更大的負 margin 擴展顯示區域
          width: isTouchDevice ? 'calc(100% + 4vw)' : '100%', // 手機上擴展寬度以容納負 margin
        }}
        onWheel={(e) => {
          // 監聽滾輪事件來追蹤縮放
          if (fgRef.current && !isTouchDevice) {
            // 節流保存視圖狀態
            if (viewStateSaveTimeoutRef.current) {
              clearTimeout(viewStateSaveTimeoutRef.current)
            }
            
            viewStateSaveTimeoutRef.current = setTimeout(() => {
              try {
                const currentZoom = fgRef.current.zoom() || 1.0
                // center() 方法不能用來獲取當前中心點，只能設置中心點
                // 使用 viewStateRef 中保存的值，或使用默認值
                const panX = viewStateRef.current.panX || 0
                const panY = viewStateRef.current.panY || 0
                viewStateRef.current = {
                  zoom: currentZoom,
                  panX,
                  panY,
                }
                saveViewState(currentZoom, panX, panY)
              } catch (e) {
                console.warn('保存視圖狀態失敗:', e)
              }
            }, 500)
          }
        }}
      >
        {ForceGraph2D && (
          <ForceGraph2D
            ref={fgRef}
            graphData={{
              nodes: graphData.nodes
                .map(node => {
                  const totalActivity = (node.createdCount || 0) + (node.replyCount || 0) + (node.receivedReplyCount || 0)
                  const nodeWithActivity: any = {
                    ...node,
                    name: node.label,
                    totalActivity,
                  }
                  
                  // 如果有保存的位置，設置固定位置
                  if ((node as any).savedPosition) {
                    const savedPos = (node as any).savedPosition
                    // 設置固定位置，防止力模擬移動
                    nodeWithActivity.fx = savedPos.x
                    nodeWithActivity.fy = savedPos.y
                    // 同時設置初始位置
                    nodeWithActivity.x = savedPos.x
                    nodeWithActivity.y = savedPos.y
                    
                    // 初始化節點位置追蹤
                    nodesPositionRef.current.set(node.id, {
                      x: savedPos.x,
                      y: savedPos.y,
                      fx: savedPos.x,
                      fy: savedPos.y,
                    })
                  }
                  
                  return nodeWithActivity
                })
                .sort((a, b) => b.totalActivity - a.totalActivity) // 從高到低排序
                .map((node, index, array) => {
                  // 計算排名：相同活動量的節點應該有相同排名
                  // 找到第一個活動量相同的節點的索引，作為排名
                  const firstSameActivityIndex = array.findIndex(n => n.totalActivity === node.totalActivity)
                  const rank = firstSameActivityIndex + 1 // 排名從 1 開始
                  
                  return {
                    ...node,
                    rank, // 相同活動量的節點有相同排名
                  }
                }),
              links: graphData.edges.map(edge => ({
                ...edge,
                source: edge.from,
                target: edge.to,
              })),
            }}
            nodeCanvasObject={nodeCanvasObject}
            nodeCanvasObjectMode={() => 'replace'}
            nodeVal={(node: any) => calculateNodeRadius(node)}
            nodeRelSize={1}
            linkDirectionalArrowLength={10}
            linkDirectionalArrowRelPos={0.92}
            linkDirectionalArrowColor={() => '#333333'}
            linkWidth={1.5}
            linkColor={() => '#999999'}
            {...({ linkDistance: 80 } as any)} // 增加距離，讓有連接的節點之間有足夠空間顯示箭頭（節點半徑約15-25px，兩個節點半徑之和約30-50px，80px確保箭頭清晰可見）
            d3AlphaDecay={graphData.nodes.some((node: any) => node.savedPosition) ? 0 : 0.03} // 如果有保存位置，設置為 0 立即停止
            d3VelocityDecay={0.4} // 更快停止
            warmupTicks={50}
            cooldownTicks={graphData.nodes.some((node: any) => node.savedPosition) ? 0 : 100} // 如果有保存位置，不運行冷卻
            onNodeClick={(node) => {
              handleNodeClick(node)
              // 點擊後不要重新啟動力模擬
              // 保持當前布局
            }}
            onEngineStop={() => {
              // 引擎停止時保存視圖狀態（包括縮放和平移）
              if (fgRef.current) {
                try {
                  const currentZoom = fgRef.current.zoom() || 1.0
                  // center() 方法需要參數來獲取當前中心點，如果沒有固定節點則不保存視圖狀態
                  // 因為沒有固定節點時，圖表會自動調整，保存視圖狀態沒有意義
                  const hasFixedNodes = graphData?.nodes.some((node: any) => node.fx !== null && node.fy !== null)
                  if (hasFixedNodes) {
                    // 如果有固定節點，嘗試獲取當前視圖中心（使用默認值）
                    viewStateRef.current = {
                      zoom: currentZoom,
                      panX: 0, // 無法直接獲取，使用默認值
                      panY: 0, // 無法直接獲取，使用默認值
                    }
                  }
                  
                  // 節流保存視圖狀態
                  if (viewStateSaveTimeoutRef.current) {
                    clearTimeout(viewStateSaveTimeoutRef.current)
                  }
                  
                  viewStateSaveTimeoutRef.current = setTimeout(() => {
                    // 使用 viewStateRef 中保存的值，或使用默認值
                    const panX = viewStateRef.current.panX || 0
                    const panY = viewStateRef.current.panY || 0
                    saveViewState(currentZoom, panX, panY)
                  }, 500)
                } catch (e) {
                  console.warn('保存視圖狀態失敗:', e)
                }
              }
              
              // 引擎停止時，檢查是否有固定節點，如果有就完全停止模擬
              if (fgRef.current && graphData) {
                try {
                  // 嘗試從 ForceGraph2D 獲取節點（但這可能返回空數組）
                  // 所以我們使用 graphData.nodes 來初始化追蹤
                  graphData.nodes.forEach((dataNode) => {
                    if (dataNode.id && !nodesPositionRef.current.has(dataNode.id)) {
                      // 如果節點還沒有被追蹤，嘗試從 ForceGraph2D 獲取位置
                      // 但由於無法直接訪問，我們先不初始化（等待拖動時初始化）
                      // 或者，如果有保存的位置，使用保存的位置
                      if ((dataNode as any).savedPosition) {
                        const savedPos = (dataNode as any).savedPosition
                        nodesPositionRef.current.set(dataNode.id, {
                          x: savedPos.x,
                          y: savedPos.y,
                          fx: savedPos.x,
                          fy: savedPos.y,
                        })
                      }
                    }
                  })
                  
                  const allNodes = fgRef.current.graphData?.nodes || []
                  const hasFixedNodes = allNodes.some((n: any) => n.fx !== null && n.fy !== null) || 
                                       Array.from(nodesPositionRef.current.values()).some(pos => pos.fx !== null)
                  
                  // 如果有固定節點，完全停止模擬，不再重新啟動
                  if (hasFixedNodes) {
                    const simulation = fgRef.current.d3Force('simulation')
                    if (simulation) {
                      simulation.stop()
                      simulation.alpha(0) // 設置 alpha 為 0，確保模擬停止
                    }
                    // 確保所有節點都被固定（從 ForceGraph2D 獲取）
                    allNodes.forEach((n: any) => {
                      if (n.fx === null || n.fy === null) {
                        const nodeX = typeof n.x === 'number' ? n.x : 0
                        const nodeY = typeof n.y === 'number' ? n.y : 0
                        n.fx = nodeX
                        n.fy = nodeY
                        // 同時更新追蹤
                        if (n.id) {
                          nodesPositionRef.current.set(n.id, {
                            x: nodeX,
                            y: nodeY,
                            fx: nodeX,
                            fy: nodeY,
                          })
                        }
                      }
                    })
                    return // 不執行後續的力參數設置和自動縮放
                  }
                  
                  // 使用固定的距離
                  const linkForce = fgRef.current.d3Force('link')
                  if (linkForce) linkForce.distance(80) // 增加距離，確保箭頭可見
                  
                  const chargeForce = fgRef.current.d3Force('charge')
                  if (chargeForce) chargeForce.strength(-40)
                  
                  const centerForce = fgRef.current.d3Force('center')
                  if (centerForce) centerForce.strength(0.6)
                  
                  // 自動縮放和居中，確保所有節點都在畫面內
                  setTimeout(() => {
                    if (fgRef.current) {
                      fgRef.current.zoomToFit(200, 200)
                    }
                  }, 100)
                } catch (e) {
                  console.error('引擎停止時設置力失敗:', e)
                }
              }
            }}
            width={isTouchDevice ? Math.max(containerSize.width, window.innerWidth * 0.98) : containerSize.width}
            height={containerSize.height}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={isTouchDevice} // 手機上啟用平移，桌面保持關閉
            onBackgroundClick={() => {
              // 背景點擊時保存視圖狀態
              if (fgRef.current) {
                try {
                  const currentZoom = fgRef.current.zoom() || 1.0
                  // center() 方法不能用來獲取當前中心點，只能設置中心點
                  // 使用默認值 0, 0
                  const pan = { x: 0, y: 0 }
                  viewStateRef.current = {
                    zoom: currentZoom,
                    panX: pan.x || 0,
                    panY: pan.y || 0,
                  }
                  saveViewState(currentZoom, pan.x || 0, pan.y || 0)
                } catch (e) {
                  console.warn('保存視圖狀態失敗:', e)
                }
              }
            }}
            onNodeDrag={(node) => {
              // 節點拖動時，固定該節點位置，防止力模擬移動它
              // 直接更新，不使用 requestAnimationFrame，確保即時響應
              const nodeX = typeof node.x === 'number' ? node.x : 0
              const nodeY = typeof node.y === 'number' ? node.y : 0
              
              // 直接更新節點固定位置，這是最關鍵的操作，必須即時執行
              node.fx = nodeX
              node.fy = nodeY
              
              // 使用 requestAnimationFrame 節流更新 Map，減少頻繁操作
              // 但保持節點位置更新即時，確保拖動流暢
              if (dragRafRef.current) {
                cancelAnimationFrame(dragRafRef.current)
              }
              
              dragRafRef.current = requestAnimationFrame(() => {
                // 只在動畫幀中更新位置追蹤，減少 Map 操作頻率
                if (node.id) {
                  nodesPositionRef.current.set(node.id, {
                    x: nodeX,
                    y: nodeY,
                    fx: nodeX,
                    fy: nodeY,
                  })
                }
              })
            }}
            onNodeDragEnd={(node) => {
              // 清理拖動時的 requestAnimationFrame
              if (dragRafRef.current) {
                cancelAnimationFrame(dragRafRef.current)
                dragRafRef.current = null
              }
              
              // 拖動結束時，保持固定位置，不讓力模擬移動它
              // 確保使用最新的 x, y 值來固定節點
              const finalX = typeof node.x === 'number' ? node.x : 0
              const finalY = typeof node.y === 'number' ? node.y : 0
              node.fx = finalX
              node.fy = finalY
              
              // 更新節點位置追蹤（拖動結束時才更新，減少頻繁操作）
              if (node.id) {
                nodesPositionRef.current.set(node.id, {
                  x: finalX,
                  y: finalY,
                  fx: finalX,
                  fy: finalY,
                })
              }
              
              console.log('節點拖動結束 (手機版:', isTouchDevice, '):', {
                nodeId: node.id,
                x: finalX,
                y: finalY,
                fx: node.fx,
                fy: node.fy,
              })
              
              // 手機上立即觸發保存，不等待節流
              if (isTouchDevice) {
                // 清除現有的節流計時器
                if (positionSaveTimeoutRef.current) {
                  clearTimeout(positionSaveTimeoutRef.current)
                }
                
                // 立即保存（但使用短延遲確保所有節點位置已更新）
                positionSaveTimeoutRef.current = setTimeout(() => {
                  saveNodePositions()
                  // 同時保存視圖狀態
                  if (fgRef.current) {
                    try {
                      const currentZoom = fgRef.current.zoom() || 1.0
                      // center() 方法不能用來獲取當前中心點，只能設置中心點
                      // 使用默認值 0, 0
                      const pan = { x: 0, y: 0 }
                      saveViewState(currentZoom, pan.x || 0, pan.y || 0)
                    } catch (e) {
                      console.warn('保存視圖狀態失敗:', e)
                    }
                  }
                }, 100)
              }
              
              // 完全停止力模擬，防止所有節點繼續漂移
              // 使用 requestAnimationFrame 確保在下一幀執行，不阻塞拖動結束的回調
              requestAnimationFrame(() => {
                if (fgRef.current) {
                  try {
                    // 方法1：停止模擬
                    const simulation = fgRef.current.d3Force('simulation')
                    if (simulation) {
                      simulation.stop() // 完全停止模擬
                      simulation.alpha(0) // 設置 alpha 為 0，確保停止
                    }
                  
                  // 方法2：固定所有節點，防止任何節點移動
                  // 使用 graphData state 來獲取所有節點 ID，然後從 ForceGraph2D 獲取實際節點對象
                  if (graphData && graphData.nodes) {
                    // 從 ForceGraph2D 獲取所有節點（通過遍歷 graphData）
                    graphData.nodes.forEach((dataNode) => {
                      // 嘗試從 ForceGraph2D 獲取對應的節點對象
                      // 注意：我們需要通過某種方式訪問 ForceGraph2D 內部的節點
                      // 由於無法直接訪問，我們使用 nodesPositionRef 來追蹤
                      const trackedPos = nodesPositionRef.current.get(dataNode.id)
                      if (trackedPos && trackedPos.fx !== null && trackedPos.fy !== null) {
                        // 位置已經被追蹤，不需要額外操作
                      } else {
                        // 如果節點還沒有被追蹤，從 node 參數中獲取（這是被拖動的節點）
                        if (node.id === dataNode.id) {
                          nodesPositionRef.current.set(dataNode.id, {
                            x: finalX,
                            y: finalY,
                            fx: finalX,
                            fy: finalY,
                          })
                        }
                      }
                    })
                  }
                  } catch (e) {
                    console.warn('停止模擬失敗:', e)
                  }
                }
              })
              
              // 桌面版：節流保存所有節點位置到後端（手機版已在上面立即保存）
              if (!isTouchDevice) {
                if (positionSaveTimeoutRef.current) {
                  clearTimeout(positionSaveTimeoutRef.current)
                }
                
                positionSaveTimeoutRef.current = setTimeout(() => {
                  saveNodePositions()
                }, 500) // 500ms 節流，確保節點位置已更新
              }
            }}
          />
        )}
      </div>

      {/* 右側：統計面板 */}
      {selectedNode && graphData.userStatistics[selectedNode.id] && (
        <div className="w-full sm:w-80 mt-4 sm:mt-0 sm:ml-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-y-auto max-h-[400px] sm:max-h-[600px]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {selectedNode.label}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                總共建立 <span className="font-semibold text-purple-600">{graphData.userStatistics[selectedNode.id].createdCount}</span> 個節點
              </p>
              <p className="text-gray-600">
                回覆過 <span className="font-semibold text-purple-600">{graphData.userStatistics[selectedNode.id].replyCount}</span> 個節點
              </p>
              <p className="text-gray-600">
                且建立的節點被 <span className="font-semibold text-purple-600">{graphData.userStatistics[selectedNode.id].receivedReplyCount}</span> 則節點回覆
              </p>
            </div>
          </div>

          {/* 回覆過的節點表格 */}
          {graphData.userStatistics[selectedNode.id].replyTable && 
           graphData.userStatistics[selectedNode.id].replyTable.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                回覆過 {graphData.userStatistics[selectedNode.id].replyCount} 個節點
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                        來源
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 border-b border-gray-200">
                        數量
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphData.userStatistics[selectedNode.id].replyTable.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-b-0">
                        <td className="px-3 py-2 text-gray-800">{item.userName}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.replyCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 被回覆的節點表格 */}
          {graphData.userStatistics[selectedNode.id].receivedReplyTable && 
           graphData.userStatistics[selectedNode.id].receivedReplyTable.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                且建立的節點被 {graphData.userStatistics[selectedNode.id].receivedReplyCount} 則節點回覆
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                        來源
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 border-b border-gray-200">
                        數量
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphData.userStatistics[selectedNode.id].receivedReplyTable.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-b-0">
                        <td className="px-3 py-2 text-gray-800">{item.userName}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.receivedReplyCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 關閉按鈕 */}
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            關閉
          </button>
        </div>
      )}
    </div>
  )
}

