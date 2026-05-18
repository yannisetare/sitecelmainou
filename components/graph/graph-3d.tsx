'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { useGraphStore } from '@/lib/store'
import type { ForceGraphNode, ForceGraphLink } from '@/lib/types'

// Dynamically import to avoid SSR issues with Three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-graph-bg">
      <div className="text-muted-foreground">Loading 3D graph...</div>
    </div>
  )
})

interface Graph3DProps {
  width: number
  height: number
}

export function Graph3D({ width, height }: Graph3DProps) {
  const graphRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  
  const { 
    getGraphData, 
    setSelectedNode, 
    setHoveredNode,
    selectedNode,
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
    const isAccessible = canAccessNode(node.id)
    
    if (!isAccessible) return '#333344' // Locked - dark gray
    if (isSelected) return '#ffffff'
    
    switch (node.status) {
      case 'completed':
        return '#50d0a0' // Teal accent
      case 'in_progress':
        return '#e0c060' // Yellow/gold
      case 'unlocked':
        return '#6080e0' // Primary blue
      case 'locked':
      default:
        return '#555566' // Muted gray
    }
  }, [selectedNode, canAccessNode])

  // Get node size based on node size property
  const getNodeSize = useCallback((node: ForceGraphNode) => {
    const isAccessible = canAccessNode(node.id)
    const baseSize = isAccessible ? 6 : 4
    return baseSize + ((node.size || 1) * 1.5)
  }, [canAccessNode])

  // Check if node has active learners
  const hasActiveLearners = useCallback((nodeId: string) => {
    return presence.some(p => p.node_id === nodeId)
  }, [presence])

  // Handle node click
  const handleNodeClick = useCallback((node: ForceGraphNode) => {
    const fullNode = nodes.find(n => n.id === node.id)
    if (fullNode && canAccessNode(node.id)) {
      setSelectedNode(fullNode)
      
      // Fly to node with camera animation
      if (graphRef.current) {
        const distance = 100
        const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0)
        graphRef.current.cameraPosition(
          { 
            x: (node.x || 0) * distRatio, 
            y: (node.y || 0) * distRatio, 
            z: (node.z || 0) * distRatio 
          },
          { x: node.x, y: node.y, z: node.z },
          2000
        )
      }
    }
  }, [nodes, canAccessNode, setSelectedNode])

  // Handle node hover
  const handleNodeHover = useCallback((node: ForceGraphNode | null) => {
    if (node) {
      const fullNode = nodes.find(n => n.id === node.id)
      setHoveredNode(fullNode || null)
      document.body.style.cursor = canAccessNode(node.id) ? 'pointer' : 'not-allowed'
    } else {
      setHoveredNode(null)
      document.body.style.cursor = 'default'
    }
  }, [nodes, setHoveredNode, canAccessNode])

  // Custom 3D object for nodes using Three.js sprites
  const nodeThreeObject = useCallback((node: ForceGraphNode) => {
    // We'll use the default sphere but customize via nodeColor and nodeVal
    return undefined // Use default rendering with our custom colors
  }, [])

  // Get link color
  const getLinkColor = useCallback((link: ForceGraphLink) => {
    const source = typeof link.source === 'string' 
      ? graphData.nodes.find(n => n.id === link.source) 
      : link.source as ForceGraphNode
    const target = typeof link.target === 'string' 
      ? graphData.nodes.find(n => n.id === link.target) 
      : link.target as ForceGraphNode
    
    if (!source || !target) return '#333344'
    
    const sourceAccessible = canAccessNode(source.id)
    const targetAccessible = canAccessNode(target.id)
    
    if (!sourceAccessible || !targetAccessible) {
      return '#222233'
    }
    
    return '#4466aa'
  }, [canAccessNode, graphData.nodes])

  // Node label
  const getNodeLabel = useCallback((node: ForceGraphNode) => {
    const isAccessible = canAccessNode(node.id)
    const hasLearners = hasActiveLearners(node.id)
    
    if (!isAccessible) {
      return `<div style="background: rgba(30,30,50,0.9); padding: 8px 12px; border-radius: 8px; border: 1px solid #333; font-family: Geist, sans-serif;">
        <div style="color: #888; font-weight: 500;">Locked</div>
        <div style="color: #666; font-size: 12px;">Complete prerequisites to unlock</div>
      </div>`
    }
    
    return `<div style="background: rgba(30,30,50,0.95); padding: 8px 12px; border-radius: 8px; border: 1px solid #4466aa; font-family: Geist, sans-serif;">
      <div style="color: #fff; font-weight: 600;">${node.label}</div>
      ${node.description ? `<div style="color: #aaa; font-size: 12px; margin-top: 4px;">${node.description}</div>` : ''}
      <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 11px;">
        ${hasLearners ? '<span style="color: #50d0a0;">Active learners</span>' : ''}
      </div>
    </div>`
  }, [canAccessNode, hasActiveLearners])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-graph-bg">
        <div className="text-muted-foreground">Loading 3D graph...</div>
      </div>
    )
  }

  return (
    <ForceGraph3D
      ref={graphRef}
      width={width}
      height={height}
      graphData={graphData}
      nodeColor={getNodeColor}
      nodeVal={getNodeSize}
      nodeLabel={getNodeLabel}
      nodeThreeObject={nodeThreeObject}
      linkColor={getLinkColor}
      linkWidth={1}
      linkOpacity={0.4}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.005}
      linkDirectionalParticleWidth={1.5}
      onNodeClick={handleNodeClick}
      onNodeHover={handleNodeHover}
      backgroundColor="#0d0d1a"
      showNavInfo={false}
      d3VelocityDecay={0.3}
      cooldownTicks={100}
      enableNodeDrag={false}
    />
  )
}
