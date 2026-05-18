'use client'

import { useState, useEffect, useRef } from 'react'
import { useGraphStore } from '@/lib/store'
import { Graph2D } from './graph-2d'
import { Graph3D } from './graph-3d'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { GraphNode } from '@/lib/types'

interface GraphContainerProps {
  className?: string
}

export function GraphContainer({ className }: GraphContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // New node form state
  const [newNodeTitle, setNewNodeTitle] = useState('')
  const [newNodeDescription, setNewNodeDescription] = useState('')
  const [newNodeGroup, setNewNodeGroup] = useState('')
  const [newNodeContent, setNewNodeContent] = useState('')
  
  const { 
    viewMode, 
    setViewMode, 
    selectedNode,
    hoveredNode,
    getGraphData,
    presence,
    currentGraph,
    nodes,
    setNodes,
    isTeacher,
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

  const handleCreateNode = async () => {
    if (!currentGraph || !newNodeTitle.trim()) return
    
    setIsCreating(true)
    
    try {
      const supabase = createClient()
      
      // Calculate position based on existing nodes
      const offsetX = (nodes.length % 5) * 150 - 300
      const offsetY = Math.floor(nodes.length / 5) * 120 - 150
      
      const { data, error } = await supabase
        .from('nodes')
        .insert({
          graph_id: currentGraph.id,
          label: newNodeTitle.trim(),
          description: newNodeDescription.trim() || null,
          node_type: newNodeGroup || 'concept',
          content_type: 'markdown',
          content: {
            markdown: newNodeContent.trim() || `# ${newNodeTitle}\n\nConținut pentru acest concept.`
          },
          position_x: offsetX,
          position_y: offsetY,
          position_z: 0,
          size: 1,
          estimated_minutes: 10,
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Update local state with new node
      setNodes([...nodes, data as GraphNode])
      
      // Reset form and close dialog
      setNewNodeTitle('')
      setNewNodeDescription('')
      setNewNodeGroup('')
      setNewNodeContent('')
      setIsAddNodeOpen(false)
      
    } catch (error) {
      console.error('Error creating node:', error)
    } finally {
      setIsCreating(false)
    }
  }

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
              <span className="text-muted-foreground">Noduri</span>
              <span className="font-medium text-foreground">{graphData.nodes.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Conexiuni</span>
              <span className="font-medium text-foreground">{graphData.links.length}</span>
            </div>
            {activeLearnersCount > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Activi acum</span>
                <span className="font-medium text-accent">{activeLearnersCount}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Add Node Button - Only for teachers */}
        {isTeacher && currentGraph && (
          <Dialog open={isAddNodeOpen} onOpenChange={setIsAddNodeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Add Node
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adaugă Nod Nou</DialogTitle>
                <DialogDescription>
                  Creează un nou concept în graful de cunoștințe.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="node-title">Titlu *</Label>
                  <Input
                    id="node-title"
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    placeholder="Ex: Introducere în Algebră"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="node-group">Grup / Sub-capitol</Label>
                  <Select value={newNodeGroup} onValueChange={setNewNodeGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează grupul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Nivel Începător</SelectItem>
                      <SelectItem value="intermediate">Nivel Intermediar</SelectItem>
                      <SelectItem value="advanced">Nivel Avansat</SelectItem>
                      <SelectItem value="concept">Concept General</SelectItem>
                      <SelectItem value="exercise">Exercițiu Practic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="node-description">Descriere</Label>
                  <Input
                    id="node-description"
                    value={newNodeDescription}
                    onChange={(e) => setNewNodeDescription(e.target.value)}
                    placeholder="Descriere scurtă a conceptului"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="node-content">Conținut Markdown</Label>
                  <Textarea
                    id="node-content"
                    value={newNodeContent}
                    onChange={(e) => setNewNodeContent(e.target.value)}
                    placeholder="# Titlu&#10;&#10;Conținutul lecției în format Markdown..."
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddNodeOpen(false)}>
                  Anulează
                </Button>
                <Button 
                  onClick={handleCreateNode}
                  disabled={!newNodeTitle.trim() || isCreating}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Se creează...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Creează Nod
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-card/80 backdrop-blur-sm border-border/50 z-10">
        <div className="text-xs font-medium text-foreground mb-2">Legendă</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-completed" />
            <span className="text-muted-foreground">Completat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-in-progress" />
            <span className="text-muted-foreground">În Progres</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-unlocked" />
            <span className="text-muted-foreground">Deblocat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-locked opacity-40" />
            <span className="text-muted-foreground">Blocat</span>
          </div>
        </div>
      </Card>

      {/* Node info tooltip */}
      {hoveredNode && !selectedNode && (
        <Card className="absolute top-4 right-4 p-4 bg-card/95 backdrop-blur-sm border-border/50 z-10 max-w-xs">
          <h3 className="font-semibold text-foreground text-sm">{hoveredNode.label}</h3>
          {hoveredNode.description && (
            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
              {hoveredNode.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-muted-foreground">
              Click pentru detalii
            </span>
          </div>
        </Card>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/60 z-10">
        {viewMode === '2d' ? (
          <span>Scroll pentru zoom, drag pentru navigare</span>
        ) : (
          <span>Drag pentru rotire, scroll pentru zoom</span>
        )}
      </div>
    </div>
  )
}
