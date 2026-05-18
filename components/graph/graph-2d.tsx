'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { useGraphStore } from '@/lib/store'
import type { ForceGraphNode, ForceGraphLink } from '@/lib/types'

// Dynamically import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-graph-bg">
      <div className="text-muted-foreground">Loading graph...</div>
    </div>
  )
})

interface Graph2DProps {
  width: number
  height: number
}

export function Graph2D({ width, height }: Graph2DProps) {
  const graphRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  
  const { 
    getGraphData, 
    setSelectedNode, 
    setHoveredNode,
    selectedNode,
    hoveredNode,
    nodes,
    canAccessNode,
    presence,
  } = useGraphStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const graphData = getGraphData()

  // Get node color based on status
  const getNodeColor = useCallback((node: ForceGraphNode) => {
    const isSelected = selectedNode?.id === node.id
    const isHovered = hoveredNode?.id === node.id
    
    if (isSelected) return '#ffffff'
    if (isHovered) return '#e0e0ff'
    
    switch (node.status) {
      case 'completed':
        return 'oklch(0.75 0.15 170)' // Teal accent
      case 'in_progress':
        return 'oklch(0.75 0.15 90)' // Yellow/gold
      case 'unlocked':
        return 'oklch(0.65 0.2 250)' // Primary blue
      case 'locked':
      default:
        return 'oklch(0.4 0.02 240)' // Muted gray
    }
  }, [selectedNode, hoveredNode])

  // Get node size based on node size property
  const getNodeSize = useCallback((node: ForceGraphNode) => {
    const baseSize = 8
    return baseSize + ((node.size || 1) * 2)
  }, [])

  // Check if node has active learners
  const hasActiveLearners = useCallback((nodeId: string) => {
    return presence.some(p => p.node_id === nodeId)
  }, [presence])

  // Handle node click
  const handleNodeClick = useCallback((node: ForceGraphNode) => {
    const fullNode = nodes.find(n => n.id === node.id)
    if (fullNode && canAccessNode(node.id)) {
      setSelectedNode(fullNode)
      
      // Center on node with smooth animation
      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 500)
        graphRef.current.zoom(2, 500)
      }
    }
  }, [nodes, canAccessNode, setSelectedNode])

  // Handle node hover
  const handleNodeHover = useCallback((node: ForceGraphNode | null) => {
    if (node) {
      const fullNode = nodes.find(n => n.id === node.id)
      setHoveredNode(fullNode || null)
    } else {
      setHoveredNode(null)
    }
  }, [nodes, setHoveredNode])

  // Custom node rendering with fog-of-war effect
  const nodeCanvasObject = useCallback((node: ForceGraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isAccessible = canAccessNode(node.id)
    const isSelected = selectedNode?.id === node.id
    const isHovered = hoveredNode?.id === node.id
    const hasLearners = hasActiveLearners(node.id)
    
    const size = getNodeSize(node)
    const fontSize = Math.max(10 / globalScale, 3)
    
    // Node glow effect for selected/hovered
    if (isSelected || isHovered) {
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, size + 4, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected 
        ? 'rgba(100, 130, 255, 0.4)' 
        : 'rgba(100, 130, 255, 0.2)'
      ctx.fill()
    }
    
    // Active learners indicator (pulsing ring)
    if (hasLearners && !isSelected) {
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, size + 6, 0, 2 * Math.PI)
      ctx.strokeStyle = 'rgba(120, 200, 170, 0.6)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    // Main node
    ctx.beginPath()
    ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI)
    
    // Fog-of-war: locked nodes are semi-transparent
    if (!isAccessible) {
      ctx.globalAlpha = 0.3
    }
    
    ctx.fillStyle = getNodeColor(node)
    ctx.fill()
    
    // Border
    ctx.strokeStyle = isAccessible ? 'rgba(255,255,255,0.3)' : 'rgba(100,100,100,0.2)'
    ctx.lineWidth = isSelected ? 2 : 1
    ctx.stroke()
    
    ctx.globalAlpha = 1
    
    // Label (only show if zoomed in enough or selected/hovered)
    if (globalScale > 0.8 || isSelected || isHovered) {
      ctx.font = `${fontSize}px 'Geist', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      
      // Text background for readability
      const textWidth = ctx.measureText(node.label).width
      ctx.fillStyle = 'rgba(10, 10, 30, 0.8)'
      ctx.fillRect(
        node.x! - textWidth / 2 - 2,
        node.y! + size + 2,
        textWidth + 4,
        fontSize + 4
      )
      
      ctx.fillStyle = isAccessible ? '#ffffff' : '#666666'
      ctx.fillText(node.label, node.x!, node.y! + size + 4)
    }
  }, [canAccessNode, selectedNode, hoveredNode, getNodeColor, getNodeSize, hasActiveLearners])

  // Custom link rendering
  const linkCanvasObject = useCallback((link: ForceGraphLink, ctx: CanvasRenderingContext2D) => {
    const source = link.source as ForceGraphNode
    const target = link.target as ForceGraphNode
    
    if (!source.x || !source.y || !target.x || !target.y) return
    
    const sourceAccessible = canAccessNode(source.id)
    const targetAccessible = canAccessNode(target.id)
    
    ctx.beginPath()
    ctx.moveTo(source.x, source.y)
    ctx.lineTo(target.x, target.y)
    
    // Fog-of-war for links
    if (!sourceAccessible || !targetAccessible) {
      ctx.globalAlpha = 0.15
      ctx.strokeStyle = '#444466'
    } else {
      ctx.globalAlpha = 0.4
      ctx.strokeStyle = '#6680cc'
    }
    
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1
    
    // Arrow head for direction
    if (sourceAccessible && targetAccessible) {
      const angle = Math.atan2(target.y - source.y, target.x - source.x)
      const arrowLength = 6
      const targetSize = 8 + ((target.size || 1) * 2)
      
      const arrowX = target.x - Math.cos(angle) * (targetSize + 4)
      const arrowY = target.y - Math.sin(angle) * (targetSize + 4)
      
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
        arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
        arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = '#6680cc'
      ctx.globalAlpha = 0.6
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }, [canAccessNode])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-graph-bg">
        <div className="text-muted-foreground">Loading graph...</div>
      </div>
    )
  }

  return (
    <ForceGraph2D
      ref={graphRef}
      width={width}
      height={height}
      graphData={graphData}
      nodeCanvasObject={nodeCanvasObject}
      linkCanvasObject={linkCanvasObject}
      onNodeClick={handleNodeClick}
      onNodeHover={handleNodeHover}
      backgroundColor="oklch(0.08 0.02 250)"
      nodeRelSize={8}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
      linkDirectionalParticleWidth={2}
      d3VelocityDecay={0.3}
      cooldownTicks={100}
      enableNodeDrag={false}
      minZoom={0.5}
      maxZoom={5}
    />
  )
}
