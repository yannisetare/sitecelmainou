import { create } from 'zustand'
import type { 
  Graph, 
  GraphNode, 
  Edge, 
  UserProgress, 
  Profile,
  Class,
  ClassMember,
  ForceGraphData,
  ForceGraphNode,
  ForceGraphLink,
  ProgressStatus,
  EduClub,
  ClubMember,
  ChatMessage,
  UploadedFile,
  UserPresence,
} from '@/lib/types'

interface GraphState {
  // Current graph data
  currentGraph: Graph | null
  nodes: GraphNode[]
  edges: Edge[]
  userProgress: Map<string, UserProgress>
  
  // Search and filters
  searchQuery: string
  activeFilters: string[]
  availableCategories: string[]
  
  // File uploads
  uploadedFiles: UploadedFile[]
  isUploading: boolean
  
  // Visualization
  viewMode: '2d' | '3d'
  selectedNode: GraphNode | null
  hoveredNode: GraphNode | null
  
  // User
  user: Profile | null
  isTeacher: boolean
  
  // Classes
  classes: Class[]
  joinedClasses: Class[]
  currentClass: Class | null
  classMembers: ClassMember[]
  
  // EduClubs
  eduClubs: EduClub[]
  currentClub: EduClub | null
  clubMembers: ClubMember[]
  chatMessages: ChatMessage[]
  presence: UserPresence[]
  
  // UI state
  isSidebarOpen: boolean
  isContentPanelOpen: boolean
  isMobileMenuOpen: boolean
  activeView: 'graphs' | 'educlubs'
  
  // Actions
  setCurrentGraph: (graph: Graph | null) => void
  setNodes: (nodes: GraphNode[]) => void
  setEdges: (edges: Edge[]) => void
  setUserProgress: (progress: UserProgress[]) => void
  updateNodeProgress: (nodeId: string, status: ProgressStatus, score?: number) => void
  setSearchQuery: (query: string) => void
  setActiveFilters: (filters: string[]) => void
  toggleFilter: (filter: string) => void
  setAvailableCategories: (categories: string[]) => void
  addUploadedFile: (file: UploadedFile) => void
  updateUploadedFile: (id: string, updates: Partial<UploadedFile>) => void
  removeUploadedFile: (id: string) => void
  setIsUploading: (uploading: boolean) => void
  setViewMode: (mode: '2d' | '3d') => void
  setSelectedNode: (node: GraphNode | null) => void
  setHoveredNode: (node: GraphNode | null) => void
  setUser: (user: Profile | null) => void
  setClasses: (classes: Class[]) => void
  setJoinedClasses: (classes: Class[]) => void
  setCurrentClass: (cls: Class | null) => void
  setClassMembers: (members: ClassMember[]) => void
  setEduClubs: (clubs: EduClub[]) => void
  setCurrentClub: (club: EduClub | null) => void
  setClubMembers: (members: ClubMember[]) => void
  setChatMessages: (messages: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  setPresence: (presence: UserPresence[]) => void
  toggleSidebar: () => void
  toggleContentPanel: () => void
  toggleMobileMenu: () => void
  setActiveView: (view: 'graphs' | 'educlubs') => void
  
  // Computed
  getGraphData: () => ForceGraphData
  getNodeStatus: (nodeId: string) => ProgressStatus
  canAccessNode: (nodeId: string) => boolean
  getFilteredGraphs: (graphs: Graph[]) => Graph[]
  getCompletedNodesCount: () => number
  getTotalNodesCount: () => number
  getProgressPercentage: () => number
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  currentGraph: null,
  nodes: [],
  edges: [],
  userProgress: new Map(),
  searchQuery: '',
  activeFilters: [],
  availableCategories: ['Math', 'History', 'Science', 'Language', 'Art', 'Technology'],
  uploadedFiles: [],
  isUploading: false,
  viewMode: '2d',
  selectedNode: null,
  hoveredNode: null,
  user: null,
  isTeacher: false,
  classes: [],
  joinedClasses: [],
  currentClass: null,
  classMembers: [],
  eduClubs: [],
  currentClub: null,
  clubMembers: [],
  chatMessages: [],
  presence: [],
  isSidebarOpen: true,
  isContentPanelOpen: false,
  isMobileMenuOpen: false,
  activeView: 'graphs',
  
  // Actions
  setCurrentGraph: (graph) => set({ currentGraph: graph }),
  
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  setUserProgress: (progress) => {
    const progressMap = new Map<string, UserProgress>()
    progress.forEach(p => progressMap.set(p.node_id, p))
    set({ userProgress: progressMap })
  },
  
  updateNodeProgress: (nodeId, status, score) => {
    const { userProgress, user } = get()
    const existing = userProgress.get(nodeId)
    const updated = new Map(userProgress)
    
    updated.set(nodeId, {
      id: existing?.id || '',
      user_id: user?.id || existing?.user_id || '',
      node_id: nodeId,
      status,
      score: score ?? existing?.score ?? null,
      time_spent: existing?.time_spent ?? 0,
      completed_at: status === 'completed' 
        ? new Date().toISOString() 
        : existing?.completed_at ?? null,
      created_at: existing?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    
    set({ userProgress: updated })
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  
  toggleFilter: (filter) => {
    const { activeFilters } = get()
    if (activeFilters.includes(filter)) {
      set({ activeFilters: activeFilters.filter(f => f !== filter) })
    } else {
      set({ activeFilters: [...activeFilters, filter] })
    }
  },
  
  setAvailableCategories: (categories) => set({ availableCategories: categories }),
  
  addUploadedFile: (file) => set(state => ({ 
    uploadedFiles: [...state.uploadedFiles, file] 
  })),
  
  updateUploadedFile: (id, updates) => set(state => ({
    uploadedFiles: state.uploadedFiles.map(f => 
      f.id === id ? { ...f, ...updates } : f
    )
  })),
  
  removeUploadedFile: (id) => set(state => ({
    uploadedFiles: state.uploadedFiles.filter(f => f.id !== id)
  })),
  
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSelectedNode: (node) => set({ 
    selectedNode: node, 
    isContentPanelOpen: node !== null 
  }),
  
  setHoveredNode: (node) => set({ hoveredNode: node }),
  
  setUser: (user) => set({ 
    user, 
    isTeacher: user?.role === 'teacher' 
  }),
  
  setClasses: (classes) => set({ classes }),
  
  setJoinedClasses: (classes) => set({ joinedClasses: classes }),
  
  setCurrentClass: (cls) => set({ currentClass: cls }),
  
  setClassMembers: (members) => set({ classMembers: members }),
  
  setEduClubs: (clubs) => set({ eduClubs: clubs }),
  
  setCurrentClub: (club) => set({ currentClub: club }),
  
  setClubMembers: (members) => set({ clubMembers: members }),
  
  setChatMessages: (messages) => set({ chatMessages: messages }),
  
  addChatMessage: (message) => set(state => ({
    chatMessages: [...state.chatMessages, message]
  })),
  
  setPresence: (presence) => set({ presence }),
  
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  toggleContentPanel: () => set(state => ({ isContentPanelOpen: !state.isContentPanelOpen })),
  
  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  
  setActiveView: (view) => set({ activeView: view }),
  
  // Computed getters
  getGraphData: () => {
    const { nodes, edges, userProgress } = get()
    
    const graphNodes: ForceGraphNode[] = nodes.map(node => {
      const progress = userProgress.get(node.id)
      return {
        id: node.id,
        label: node.label,
        description: node.description,
        status: progress?.status || 'locked',
        color: node.color || undefined,
        size: node.size,
        x: node.position_x,
        y: node.position_y,
        z: node.position_z,
      }
    })
    
    const graphLinks: ForceGraphLink[] = edges.map(edge => ({
      source: edge.source_id,
      target: edge.target_id,
      weight: edge.weight,
    }))
    
    return { nodes: graphNodes, links: graphLinks }
  },
  
  getNodeStatus: (nodeId) => {
    const { userProgress } = get()
    return userProgress.get(nodeId)?.status || 'locked'
  },
  
  canAccessNode: (nodeId) => {
    const { edges, userProgress, isTeacher } = get()
    
    // Teachers can access all nodes
    if (isTeacher) return true
    
    const status = userProgress.get(nodeId)?.status
    if (status && status !== 'locked') return true
    
    // Check if all prerequisites are completed
    const prerequisites = edges.filter(e => e.target_id === nodeId)
    
    // If no prerequisites, node is accessible
    if (prerequisites.length === 0) return true
    
    // Check if all source nodes are completed
    return prerequisites.every(prereq => {
      const prereqStatus = userProgress.get(prereq.source_id)?.status
      return prereqStatus === 'completed'
    })
  },
  
  getFilteredGraphs: (graphs) => {
    const { searchQuery, activeFilters } = get()
    
    return graphs.filter(graph => {
      // Search filter
      const matchesSearch = !searchQuery || 
        graph.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (graph.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      // Category filter (if any filters are active)
      const matchesFilters = activeFilters.length === 0 || 
        activeFilters.some(filter => 
          graph.title.toLowerCase().includes(filter.toLowerCase()) ||
          (graph.description?.toLowerCase().includes(filter.toLowerCase()) ?? false)
        )
      
      return matchesSearch && matchesFilters
    })
  },
  
  getCompletedNodesCount: () => {
    const { userProgress } = get()
    let count = 0
    userProgress.forEach(p => {
      if (p.status === 'completed') count++
    })
    return count
  },
  
  getTotalNodesCount: () => {
    const { nodes } = get()
    return nodes.length
  },
  
  getProgressPercentage: () => {
    const { nodes, userProgress } = get()
    if (nodes.length === 0) return 0
    let completed = 0
    userProgress.forEach(p => {
      if (p.status === 'completed') completed++
    })
    return Math.round((completed / nodes.length) * 100)
  },
}))
