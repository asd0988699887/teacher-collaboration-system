'use client'

import { useEffect, useState, useRef } from 'react'
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

  // 更新容器大小
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({
          width: rect.width || 800,
          height: rect.height || 600,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // 載入網絡圖資料
  useEffect(() => {
    const loadGraphData = async () => {
      if (!communityId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/communities/${communityId}/network-graph`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '載入網絡圖資料失敗')
        }

        console.log('網絡圖資料載入成功:', data)
        setGraphData(data)
      } catch (err: any) {
        console.error('載入網絡圖資料錯誤:', err)
        setError(err.message || '載入網絡圖資料失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadGraphData()
  }, [communityId])

  // 設置 d3 力參數
  useEffect(() => {
    if (fgRef.current && graphData) {
      // 延遲一點確保圖表已經初始化
      setTimeout(() => {
        if (fgRef.current) {
          try {
            // 設置連線距離（40px）
            const linkForce = fgRef.current.d3Force('link')
            if (linkForce) {
              linkForce.distance(40)
            }
            // 設置節點斥力（調整為較小值）
            const chargeForce = fgRef.current.d3Force('charge')
            if (chargeForce) {
              chargeForce.strength(-300)
            }
            // 重新加熱模擬
            fgRef.current.d3ReheatSimulation()
          } catch (e) {
            console.error('設置 d3 力失敗:', e)
          }
        }
      }, 100)
    }
  }, [graphData])

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
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
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
    
    // 每高一個名次，半徑增加 1（直徑增加 2）
    const radiusIncrement = 1
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
    const radiusIncrement = 1 // 每高一名次，半徑 +1（直徑 +2）
    const rankBonus = (totalNodes - rank) * radiusIncrement
    const radius = baseRadius + rankBonus
    
    // 1. 繪製圓形節點
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = getNodeColor(node.id)
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
    <div className="w-full h-full flex">
      {/* 左側：網絡圖 */}
      <div 
        ref={containerRef}
        className="flex-1 border border-gray-200 rounded-lg overflow-hidden"
        style={{ minHeight: '600px', height: '600px' }}
      >
        {ForceGraph2D && (
          <ForceGraph2D
            ref={fgRef}
            graphData={{
              nodes: graphData.nodes
                .map(node => {
                  const totalActivity = (node.createdCount || 0) + (node.replyCount || 0) + (node.receivedReplyCount || 0)
                  return {
                    id: node.id,
                    name: node.label,
                    totalActivity,
                    ...node,
                  }
                })
                .sort((a, b) => b.totalActivity - a.totalActivity) // 從高到低排序
                .map((node, index) => ({
                  ...node,
                  rank: index + 1, // 添加排名（1 = 第一名）
                })),
              links: graphData.edges.map(edge => ({
                source: edge.from,
                target: edge.to,
                value: edge.value,
                ...edge,
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
            linkDistance={40}
            d3AlphaDecay={0.01}
            d3VelocityDecay={0.2}
            warmupTicks={50}
            cooldownTicks={100}
            onNodeClick={(node) => {
              handleNodeClick(node)
              // 點擊後不要重新啟動力模擬
              // 保持當前布局
            }}
            onEngineStop={() => {
              // 引擎停止時，再次確保力參數正確
              if (fgRef.current) {
                try {
                  const linkForce = fgRef.current.d3Force('link')
                  if (linkForce) linkForce.distance(40)
                  const chargeForce = fgRef.current.d3Force('charge')
                  if (chargeForce) chargeForce.strength(-300)
                } catch (e) {
                  console.error('引擎停止時設置力失敗:', e)
                }
              }
            }}
            width={containerSize.width}
            height={containerSize.height}
            enableNodeDrag={true}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        )}
      </div>

      {/* 右側：統計面板 */}
      {selectedNode && graphData.userStatistics[selectedNode.id] && (
        <div className="w-80 ml-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto max-h-[600px]">
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

