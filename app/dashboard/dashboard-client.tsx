'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useGraphStore } from '@/lib/store'
import { useLanguage } from '@/lib/i18n'
import { LanguageSelector } from '@/components/language-selector'
import { GraphContainer } from '@/components/graph/graph-container'
import { NodeContentPanel } from '@/components/content/node-content-panel'
import { MobileNodeAccordion } from '@/components/mobile-node-accordion'
import { FileUploadSection } from '@/components/file-upload-section'
import { EduClubsView } from '@/components/educlubs/educlubs-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { 
  Search, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  Settings, 
  LogOut,
  Network,
  Users,
  Upload,
  Filter
} from 'lucide-react'
import type { Profile, Graph, GraphNode, Edge, UserProgress } from '@/lib/types'

interface DashboardClientProps {
  user: Profile
  initialGraphs: (Graph & { owner?: { display_name: string | null; avatar_url: string | null } })[]
}

export function DashboardClient({ user, initialGraphs }: DashboardClientProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [graphs, setGraphs] = useState(initialGraphs)
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  
  const {
    setUser,
    setCurrentGraph,
    setNodes,
    setEdges,
    setUserProgress,
    currentGraph,
    selectedNode,
    setSelectedNode,
    isSidebarOpen,
    toggleSidebar,
    isContentPanelOpen,
    isMobileMenuOpen,
    toggleMobileMenu,
    searchQuery,
    setSearchQuery,
    activeFilters,
    toggleFilter,
    availableCategories,
    getFilteredGraphs,
    getProgressPercentage,
    getCompletedNodesCount,
    getTotalNodesCount,
    activeView,
    setActiveView,
    nodes,
  } = useGraphStore()

  // Initialize user in store
  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  // Load a graph
  const loadGraph = useCallback(async (graph: Graph) => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Fetch nodes
      const { data: nodesData } = await supabase
        .from('nodes')
        .select('*')
        .eq('graph_id', graph.id)
      
      // Fetch edges
      const { data: edgesData } = await supabase
        .from('edges')
        .select('*')
        .eq('graph_id', graph.id)
      
      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('node_id', (nodesData || []).map(n => n.id))
      
      setCurrentGraph(graph)
      setNodes((nodesData || []) as GraphNode[])
      setEdges((edgesData || []) as Edge[])
      setUserProgress((progressData || []) as UserProgress[])
      setSelectedNode(null)
    } catch (error) {
      console.error('Error loading graph:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id, setCurrentGraph, setNodes, setEdges, setUserProgress, setSelectedNode])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const filteredGraphs = getFilteredGraphs(graphs)
  const progressPercent = getProgressPercentage()
  const completedCount = getCompletedNodesCount()
  const totalCount = getTotalNodesCount()

  // Sidebar content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Search */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search graphs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
          />
        </div>
        
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {availableCategories.slice(0, 4).map(category => (
            <Badge
              key={category}
              variant={activeFilters.includes(category) ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-xs transition-colors",
                activeFilters.includes(category) 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/80"
              )}
              onClick={() => toggleFilter(category)}
            >
              #{category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-2">
        <button
          onClick={() => setActiveView('graphs')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            activeView === 'graphs'
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Network className="w-4 h-4" />
          My Graphs
        </button>
        <button
          onClick={() => setActiveView('educlubs')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            activeView === 'educlubs'
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Users className="w-4 h-4" />
          EduClubs
          <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/20 text-primary">
            3
          </Badge>
        </button>
      </nav>

      {/* Graphs List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
            {t('dashboard.graphs')}
          </div>
          <div className="space-y-1">
            {filteredGraphs.length === 0 ? (
              <p className="px-3 py-2 text-sm text-sidebar-foreground/50">
                {searchQuery ? 'No graphs found' : t('dashboard.noGraphs')}
              </p>
            ) : (
              filteredGraphs.map(graph => (
                <button
                  key={graph.id}
                  onClick={() => loadGraph(graph)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                    currentGraph?.id === graph.id 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    graph.is_public ? "bg-primary" : "bg-muted-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{graph.title}</div>
                    <div className="text-xs text-sidebar-foreground/50 truncate">
                      {graph.owner?.display_name || 'Unknown'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Create Graph Button (Teacher only) */}
      {user.role === 'teacher' && (
        <div className="p-2 border-t border-sidebar-border">
          <Link href="/architect">
            <Button variant="outline" className="w-full justify-start gap-2 border-dashed border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
              <Plus className="w-4 h-4" />
              {t('dashboard.createGraph')}
            </Button>
          </Link>
        </div>
      )}

      {/* User Profile Card */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.display_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.display_name}
                </div>
                <div className="text-xs text-sidebar-foreground/50 capitalize">
                  {user.role}
                </div>
              </div>
              <Settings className="w-4 h-4 text-sidebar-foreground/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="w-4 h-4 mr-2" />
              {t('nav.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              {t('nav.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              {t('nav.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          isSidebarOpen ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        {/* Logo Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Network className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">EduWeb</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <SidebarContent />
      </aside>

      {/* Collapsed Sidebar Toggle (Desktop) */}
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex fixed left-2 top-3 z-30 bg-sidebar hover:bg-sidebar-accent"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
          <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Network className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">EduWeb</span>
            </Link>
          </div>
          <div className="flex flex-col h-[calc(100%-3.5rem)]">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Graph Title & Progress */}
            {currentGraph && (
              <div className="flex items-center gap-4">
                <h1 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
                  {currentGraph.title}
                </h1>
                <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-muted rounded-full">
                  <Progress value={progressPercent} className="w-24 h-2 bg-muted-foreground/20" />
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {completedCount}/{totalCount} nodes
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentGraph && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
                className="hidden sm:flex gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            )}
            <LanguageSelector />
          </div>
        </header>

        {/* Main View Area */}
        {activeView === 'educlubs' ? (
          <EduClubsView />
        ) : currentGraph ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Upload Section (Collapsible) */}
            {showUpload && (
              <FileUploadSection onClose={() => setShowUpload(false)} />
            )}
            
            {/* Graph Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Desktop: Graph View */}
              <div className={cn(
                "hidden md:block flex-1 transition-all duration-300",
                isContentPanelOpen && "mr-96"
              )}>
                <GraphContainer className="h-full" />
              </div>

              {/* Mobile: Accordion List */}
              <div className="md:hidden flex-1 overflow-hidden">
                <MobileNodeAccordion nodes={nodes} />
              </div>

              {/* Content Panel (Desktop) */}
              {isContentPanelOpen && selectedNode && (
                <div className="hidden md:block">
                  <NodeContentPanel />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Network className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t('dashboard.selectGraph')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('dashboard.selectGraphDesc')}
              </p>
              {graphs.length === 0 && user.role === 'teacher' && (
                <Link href="/architect">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('dashboard.createFirst')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
