'use client'

import { useState, useEffect, useRef } from 'react'
import { useGraphStore } from '@/lib/store'
import { Graph2D } from './graph-2d'
import { Graph3D } from './graph-3d'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GraphContainerProps {
  className?: string
}

export function GraphContainer({ className }: GraphContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  
  const { 
    viewMode, 
    setViewMode, 
    selectedNode,
    hoveredNode,
    getGraphData,
    presence,
  } = useGraphStore()

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  const graphData = getGraphData()
  const activeLearnersCount = new Set(presence.map(p => p.user_id)).size

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
    >
      {/* Main graph */}
      {viewMode === '2d' ? (
        <Graph2D width={dimensions.width} height={dimensions.height} />
      ) : (
        <Graph3D width={dimensions.width} height={dimensions.height} />
      )}

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 z-10">
        {/* View mode toggle */}
        <Card className="p-1 bg-card/80 backdrop-blur-sm border-border/50">
          <div className="flex gap-1">
            <Button
              variant={viewMode === '2d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('2d')}
              className="text-xs"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              2D
            </Button>
            <Button
              variant={viewMode === '3d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('3d')}
              className="text-xs"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              3D
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-3 bg-card/80 backdrop-blur-sm border-border/50">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Nodes</span>
              <span className="font-medium text-foreground">{graphData.nodes.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Connections</span>
              <span className="font-medium text-foreground">{graphData.links.length}</span>
            </div>
            {activeLearnersCount > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Active learners</span>
                <span className="font-medium text-accent">{activeLearnersCount}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-card/80 backdrop-blur-sm border-border/50 z-10">
        <div className="text-xs font-medium text-foreground mb-2">Legend</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-completed" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-in-progress" />
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-unlocked" />
            <span className="text-muted-foreground">Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-locked opacity-40" />
            <span className="text-muted-foreground">Locked</span>
          </div>
        </div>
      </Card>

      {/* Node info tooltip */}
      {hoveredNode && !selectedNode && (
        <Card className="absolute top-4 right-4 p-4 bg-card/95 backdrop-blur-sm border-border/50 z-10 max-w-xs">
          <h3 className="font-semibold text-foreground text-sm">{hoveredNode.title}</h3>
          {hoveredNode.description && (
            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
              {hoveredNode.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-muted-foreground">
              Difficulty: <span className="text-foreground">{hoveredNode.difficulty}/5</span>
            </span>
            <span className="text-muted-foreground">
              ~{hoveredNode.estimated_minutes} min
            </span>
          </div>
        </Card>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/60 z-10">
        {viewMode === '2d' ? (
          <span>Scroll to zoom, drag to pan</span>
        ) : (
          <span>Drag to rotate, scroll to zoom</span>
        )}
      </div>
    </div>
  )
}
