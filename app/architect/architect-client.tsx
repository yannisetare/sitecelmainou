'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Profile, Graph, GraphNode, Edge, NodeContent } from '@/lib/types'

interface ArchitectClientProps {
  user: Profile
  initialGraphs: Graph[]
}

export function ArchitectClient({ user, initialGraphs }: ArchitectClientProps) {
  const router = useRouter()
  const [graphs, setGraphs] = useState(initialGraphs)
  const [selectedGraph, setSelectedGraph] = useState<Graph | null>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isCreateGraphOpen, setIsCreateGraphOpen] = useState(false)
  const [isCreateNodeOpen, setIsCreateNodeOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // New graph form
  const [newGraphTitle, setNewGraphTitle] = useState('')
  const [newGraphDescription, setNewGraphDescription] = useState('')
  const [newGraphPublic, setNewGraphPublic] = useState(false)

  // New node form
  const [newNodeTitle, setNewNodeTitle] = useState('')
  const [newNodeDescription, setNewNodeDescription] = useState('')
  const [newNodeDifficulty, setNewNodeDifficulty] = useState<string>('1')
  const [newNodeMinutes, setNewNodeMinutes] = useState('10')

  // Content editing
  const [editingContent, setEditingContent] = useState<NodeContent>({})

  const loadGraph = useCallback(async (graph: Graph) => {
    setLoading(true)
    setSelectedGraph(graph)
    setSelectedNode(null)
    
    try {
      const supabase = createClient()
      
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('nodes').select('*').eq('graph_id', graph.id),
        supabase.from('edges').select('*').eq('graph_id', graph.id),
      ])
      
      setNodes((nodesRes.data || []) as GraphNode[])
      setEdges((edgesRes.data || []) as Edge[])
    } catch (error) {
      console.error('Error loading graph:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateGraph = async () => {
    if (!newGraphTitle.trim()) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('graphs')
        .insert({
          title: newGraphTitle.trim(),
          description: newGraphDescription.trim() || null,
          owner_id: user.id,
          is_public: newGraphPublic,
        })
        .select()
        .single()
      
      if (error) throw error
      
      setGraphs([data as Graph, ...graphs])
      setNewGraphTitle('')
      setNewGraphDescription('')
      setNewGraphPublic(false)
      setIsCreateGraphOpen(false)
      
      // Auto-select the new graph
      loadGraph(data as Graph)
    } catch (error) {
      console.error('Error creating graph:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNode = async () => {
    if (!selectedGraph || !newNodeTitle.trim()) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Calculate position based on existing nodes
      const offsetX = (nodes.length % 5) * 100 - 200
      const offsetY = Math.floor(nodes.length / 5) * 100 - 100
      
      const { data, error } = await supabase
        .from('nodes')
        .insert({
          graph_id: selectedGraph.id,
          label: newNodeTitle.trim(),
          description: newNodeDescription.trim() || null,
          size: parseFloat(newNodeDifficulty) || 1,
          position_x: offsetX,
          position_y: offsetY,
          content: {},
        })
        .select()
        .single()
      
      if (error) throw error
      
      setNodes([...nodes, data as GraphNode])
      setNewNodeTitle('')
      setNewNodeDescription('')
      setNewNodeDifficulty('1')
      setNewNodeMinutes('10')
      setIsCreateNodeOpen(false)
    } catch (error) {
      console.error('Error creating node:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNode = async (nodeId: string, updates: Partial<GraphNode>) => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('nodes')
        .update(updates)
        .eq('id', nodeId)
      
      if (error) throw error
      
      setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n))
      
      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, ...updates })
      }
    } catch (error) {
      console.error('Error updating node:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this node?')) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('nodes')
        .delete()
        .eq('id', nodeId)
      
      if (error) throw error
      
      setNodes(nodes.filter(n => n.id !== nodeId))
      setEdges(edges.filter(e => e.source_id !== nodeId && e.target_id !== nodeId))
      
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null)
      }
    } catch (error) {
      console.error('Error deleting node:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEdge = async (sourceId: string, targetId: string) => {
    if (!selectedGraph || sourceId === targetId) return
    
    // Check if edge already exists
    if (edges.some(e => e.source_id === sourceId && e.target_id === targetId)) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('edges')
        .insert({
          graph_id: selectedGraph.id,
          source_id: sourceId,
          target_id: targetId,
          weight: 1.0,
        })
        .select()
        .single()
      
      if (error) throw error
      
      setEdges([...edges, data as Edge])
    } catch (error) {
      console.error('Error creating edge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEdge = async (edgeId: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('edges')
        .delete()
        .eq('id', edgeId)
      
      if (error) throw error
      
      setEdges(edges.filter(e => e.id !== edgeId))
    } catch (error) {
      console.error('Error deleting edge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Initialize content editing when node is selected
  useEffect(() => {
    if (selectedNode) {
      setEditingContent(selectedNode.content || {})
    }
  }, [selectedNode])

  const handleSaveContent = async () => {
    if (!selectedNode) return
    await handleUpdateNode(selectedNode.id, { content: editingContent })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Graphs list */}
      <aside className="w-72 border-r border-border bg-sidebar flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-sidebar-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-semibold text-sidebar-foreground">Architect</span>
          </Link>
        </div>

        {/* Graphs list */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                Your Graphs
              </span>
              <Dialog open={isCreateGraphOpen} onOpenChange={setIsCreateGraphOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Graph</DialogTitle>
                    <DialogDescription>
                      Create a new knowledge graph to organize your course content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="graph-title">Title</Label>
                      <Input
                        id="graph-title"
                        value={newGraphTitle}
                        onChange={(e) => setNewGraphTitle(e.target.value)}
                        placeholder="e.g., Introduction to JavaScript"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graph-description">Description</Label>
                      <Textarea
                        id="graph-description"
                        value={newGraphDescription}
                        onChange={(e) => setNewGraphDescription(e.target.value)}
                        placeholder="What will students learn?"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="graph-public">Make Public</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow anyone to view this graph
                        </p>
                      </div>
                      <Switch
                        id="graph-public"
                        checked={newGraphPublic}
                        onCheckedChange={setNewGraphPublic}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateGraphOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGraph} disabled={!newGraphTitle.trim() || loading}>
                      Create Graph
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1">
              {graphs.length === 0 ? (
                <p className="px-3 py-2 text-sm text-sidebar-foreground/50">
                  No graphs yet
                </p>
              ) : (
                graphs.map(graph => (
                  <button
                    key={graph.id}
                    onClick={() => loadGraph(graph)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                      selectedGraph?.id === graph.id 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      graph.is_public ? "bg-accent" : "bg-primary"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{graph.title}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User */}
        <div className="p-2 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user.display_name?.charAt(0).toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {user.display_name}
              </div>
              <div className="text-xs text-sidebar-foreground/50">Teacher</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {selectedGraph ? (
          <>
            {/* Node list / graph view */}
            <div className="flex-1 flex flex-col border-r border-border">
              {/* Toolbar */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <div>
                  <h1 className="font-semibold text-foreground">{selectedGraph.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    {nodes.length} nodes, {edges.length} connections
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isCreateNodeOpen} onOpenChange={setIsCreateNodeOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Node
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Node</DialogTitle>
                        <DialogDescription>
                          Add a new concept or lesson to your knowledge graph.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="node-title">Title</Label>
                          <Input
                            id="node-title"
                            value={newNodeTitle}
                            onChange={(e) => setNewNodeTitle(e.target.value)}
                            placeholder="e.g., Variables and Data Types"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="node-description">Description</Label>
                          <Textarea
                            id="node-description"
                            value={newNodeDescription}
                            onChange={(e) => setNewNodeDescription(e.target.value)}
                            placeholder="What will students learn in this node?"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="node-difficulty">Difficulty</Label>
                            <Select value={newNodeDifficulty} onValueChange={setNewNodeDifficulty}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 - Beginner</SelectItem>
                                <SelectItem value="2">2 - Easy</SelectItem>
                                <SelectItem value="3">3 - Intermediate</SelectItem>
                                <SelectItem value="4">4 - Advanced</SelectItem>
                                <SelectItem value="5">5 - Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="node-minutes">Est. Minutes</Label>
                            <Input
                              id="node-minutes"
                              type="number"
                              value={newNodeMinutes}
                              onChange={(e) => setNewNodeMinutes(e.target.value)}
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateNodeOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateNode} disabled={!newNodeTitle.trim() || loading}>
                          Create Node
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Nodes grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {nodes.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="3" />
                          <circle cx="5" cy="6" r="2" />
                          <circle cx="19" cy="6" r="2" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-foreground mb-1">No nodes yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your first node to start building the graph
                      </p>
                      <Button onClick={() => setIsCreateNodeOpen(true)}>
                        Add First Node
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {nodes.map(node => (
                      <Card 
                        key={node.id}
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary/50",
                          selectedNode?.id === node.id && "border-primary ring-1 ring-primary"
                        )}
                        onClick={() => setSelectedNode(node)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span className="truncate">{node.label}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              S{node.size || 1}
                            </span>
                          </CardTitle>
                          {node.description && (
                            <CardDescription className="text-xs line-clamp-2">
                              {node.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-primary">
                              {edges.filter(e => e.target_id === node.id).length} prereqs
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Node editor panel */}
            {selectedNode && (
              <aside className="w-96 flex flex-col bg-card">
                <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                  <h2 className="font-semibold text-foreground truncate">
                    {selectedNode.label}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedNode(null)}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="content" className="flex-1 flex flex-col">
                  <TabsList className="mx-4 mt-4 grid grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="connections">Links</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto p-4">
                    <TabsContent value="content" className="mt-0 space-y-4">
                      {/* Markdown content */}
                      <div className="space-y-2">
                        <Label>Lesson Content (Markdown)</Label>
                        <Textarea
                          value={editingContent.markdown || ''}
                          onChange={(e) => setEditingContent({ ...editingContent, markdown: e.target.value })}
                          placeholder="Write your lesson content in Markdown..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Video URL */}
                      <div className="space-y-2">
                        <Label>Video URL (optional)</Label>
                        <Input
                          value={editingContent.video_url || ''}
                          onChange={(e) => setEditingContent({ ...editingContent, video_url: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>

                      <Button onClick={handleSaveContent} disabled={loading} className="w-full">
                        Save Content
                      </Button>
                    </TabsContent>

                    <TabsContent value="connections" className="mt-0 space-y-4">
                      {/* Prerequisites */}
                      <div>
                        <Label className="text-sm font-medium">Prerequisites</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Nodes that must be completed before this one
                        </p>
                        <div className="space-y-2">
                          {edges.filter(e => e.target_id === selectedNode.id).map(edge => {
                            const sourceNode = nodes.find(n => n.id === edge.source_id)
                            return (
                              <div 
                                key={edge.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted"
                              >
                                <span className="text-sm">{sourceNode?.label}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="w-6 h-6"
                                  onClick={() => handleDeleteEdge(edge.id)}
                                >
                                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </Button>
                              </div>
                            )
                          })}
                          
                          {/* Add prerequisite */}
                          <Select onValueChange={(nodeId) => handleCreateEdge(nodeId, selectedNode.id)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Add prerequisite..." />
                            </SelectTrigger>
                            <SelectContent>
                              {nodes
                                .filter(n => n.id !== selectedNode.id)
                                .filter(n => !edges.some(e => e.source_id === n.id && e.target_id === selectedNode.id))
                                .map(node => (
                                  <SelectItem key={node.id} value={node.id}>
                                    {node.title}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Leads to */}
                      <div>
                        <Label className="text-sm font-medium">Leads To</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Nodes unlocked after completing this one
                        </p>
                        <div className="space-y-2">
                          {edges.filter(e => e.source_id === selectedNode.id).map(edge => {
                            const targetNode = nodes.find(n => n.id === edge.target_id)
                            return (
                              <div 
                                key={edge.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted"
                              >
                                <span className="text-sm">{targetNode?.title}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="w-6 h-6"
                                  onClick={() => handleDeleteEdge(edge.id)}
                                >
                                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </Button>
                              </div>
                            )
                          })}
                          
                          {/* Add leads to */}
                          <Select onValueChange={(nodeId) => handleCreateEdge(selectedNode.id, nodeId)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Add connection..." />
                            </SelectTrigger>
                            <SelectContent>
                              {nodes
                                .filter(n => n.id !== selectedNode.id)
                                .filter(n => !edges.some(e => e.source_id === selectedNode.id && e.target_id === n.id))
                                .map(node => (
                                  <SelectItem key={node.id} value={node.id}>
                                    {node.title}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={selectedNode.title}
                          onChange={(e) => handleUpdateNode(selectedNode.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={selectedNode.description || ''}
                          onChange={(e) => handleUpdateNode(selectedNode.id, { description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select 
                            value={selectedNode.difficulty.toString()} 
                            onValueChange={(v) => handleUpdateNode(selectedNode.id, { difficulty: parseInt(v) as 1|2|3|4|5 })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Beginner</SelectItem>
                              <SelectItem value="2">2 - Easy</SelectItem>
                              <SelectItem value="3">3 - Intermediate</SelectItem>
                              <SelectItem value="4">4 - Advanced</SelectItem>
                              <SelectItem value="5">5 - Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Est. Minutes</Label>
                          <Input
                            type="number"
                            value={selectedNode.estimated_minutes}
                            onChange={(e) => handleUpdateNode(selectedNode.id, { estimated_minutes: parseInt(e.target.value) || 10 })}
                            min="1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </aside>
            )}
          </>
        ) : (
          /* No graph selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Welcome to Architect Mode
              </h2>
              <p className="text-muted-foreground mb-6">
                Create and manage knowledge graphs for your students. 
                Select an existing graph or create a new one to get started.
              </p>
              <Button onClick={() => setIsCreateGraphOpen(true)}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create New Graph
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
