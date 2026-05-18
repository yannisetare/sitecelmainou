import type { Edge, GraphNode, PathNode, ProgressStatus } from '@/lib/types'

/**
 * A* Pathfinding Algorithm for finding optimal learning paths
 * through the knowledge graph
 */

interface PathfinderOptions {
  nodes: GraphNode[]
  edges: Edge[]
  userProgress: Map<string, { status: ProgressStatus; score?: number | null }>
  startNodeId: string
  goalNodeId: string
}

interface PathResult {
  path: string[]
  totalCost: number
  estimatedMinutes: number
}

/**
 * Heuristic function - estimates cost from node to goal
 * Uses difficulty and estimated time as factors
 */
function heuristic(node: GraphNode, goal: GraphNode): number {
  // Base cost from difficulty difference
  const difficultyDiff = Math.abs(node.difficulty - goal.difficulty)
  
  // Euclidean distance in position space (if positions are meaningful)
  const dx = (node.position_x || 0) - (goal.position_x || 0)
  const dy = (node.position_y || 0) - (goal.position_y || 0)
  const dz = (node.position_z || 0) - (goal.position_z || 0)
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  
  // Combine factors
  return difficultyDiff * 10 + distance * 0.1
}

/**
 * Get the cost of traversing to a node
 * Considers difficulty, time, and user's current progress
 */
function getNodeCost(
  node: GraphNode, 
  userProgress: Map<string, { status: ProgressStatus; score?: number | null }>
): number {
  const progress = userProgress.get(node.id)
  
  // If already completed, very low cost (basically free to traverse)
  if (progress?.status === 'completed') {
    return 1
  }
  
  // If in progress, reduced cost
  if (progress?.status === 'in_progress') {
    return node.difficulty * 5 + node.estimated_minutes * 0.5
  }
  
  // If locked, high cost (need to complete prerequisites)
  if (!progress || progress.status === 'locked') {
    return node.difficulty * 15 + node.estimated_minutes * 2
  }
  
  // Unlocked but not started
  return node.difficulty * 10 + node.estimated_minutes
}

/**
 * A* pathfinding algorithm
 */
export function findOptimalPath(options: PathfinderOptions): PathResult | null {
  const { nodes, edges, userProgress, startNodeId, goalNodeId } = options
  
  const nodeMap = new Map<string, GraphNode>()
  nodes.forEach(n => nodeMap.set(n.id, n))
  
  const startNode = nodeMap.get(startNodeId)
  const goalNode = nodeMap.get(goalNodeId)
  
  if (!startNode || !goalNode) {
    return null
  }
  
  // Build adjacency list (outgoing edges)
  const adjacency = new Map<string, string[]>()
  nodes.forEach(n => adjacency.set(n.id, []))
  edges.forEach(e => {
    const neighbors = adjacency.get(e.source_id) || []
    neighbors.push(e.target_id)
    adjacency.set(e.source_id, neighbors)
  })
  
  // A* data structures
  const openSet = new Set<string>([startNodeId])
  const cameFrom = new Map<string, string>()
  
  const gScore = new Map<string, number>()
  gScore.set(startNodeId, 0)
  
  const fScore = new Map<string, number>()
  fScore.set(startNodeId, heuristic(startNode, goalNode))
  
  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let current: string | null = null
    let lowestF = Infinity
    
    for (const nodeId of openSet) {
      const f = fScore.get(nodeId) ?? Infinity
      if (f < lowestF) {
        lowestF = f
        current = nodeId
      }
    }
    
    if (!current) break
    
    // Goal reached
    if (current === goalNodeId) {
      // Reconstruct path
      const path: string[] = [current]
      let node = current
      
      while (cameFrom.has(node)) {
        node = cameFrom.get(node)!
        path.unshift(node)
      }
      
      // Calculate total cost and estimated time
      let totalCost = 0
      let estimatedMinutes = 0
      
      for (const nodeId of path) {
        const n = nodeMap.get(nodeId)
        if (n) {
          totalCost += getNodeCost(n, userProgress)
          
          const progress = userProgress.get(nodeId)
          if (progress?.status !== 'completed') {
            estimatedMinutes += n.estimated_minutes
          }
        }
      }
      
      return { path, totalCost, estimatedMinutes }
    }
    
    openSet.delete(current)
    
    // Explore neighbors
    const neighbors = adjacency.get(current) || []
    
    for (const neighborId of neighbors) {
      const neighborNode = nodeMap.get(neighborId)
      if (!neighborNode) continue
      
      const tentativeG = (gScore.get(current) ?? Infinity) + getNodeCost(neighborNode, userProgress)
      
      if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, current)
        gScore.set(neighborId, tentativeG)
        fScore.set(neighborId, tentativeG + heuristic(neighborNode, goalNode))
        openSet.add(neighborId)
      }
    }
  }
  
  // No path found
  return null
}

/**
 * Find all reachable nodes from a starting point
 */
export function findReachableNodes(
  nodes: GraphNode[],
  edges: Edge[],
  startNodeId: string
): Set<string> {
  const adjacency = new Map<string, string[]>()
  nodes.forEach(n => adjacency.set(n.id, []))
  edges.forEach(e => {
    const neighbors = adjacency.get(e.source_id) || []
    neighbors.push(e.target_id)
    adjacency.set(e.source_id, neighbors)
  })
  
  const visited = new Set<string>()
  const queue = [startNodeId]
  
  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    
    visited.add(current)
    
    const neighbors = adjacency.get(current) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor)
      }
    }
  }
  
  return visited
}

/**
 * Suggest next nodes to learn based on current progress
 * Returns nodes that are unlocked or nearly unlocked
 */
export function suggestNextNodes(
  nodes: GraphNode[],
  edges: Edge[],
  userProgress: Map<string, { status: ProgressStatus }>,
  limit: number = 3
): GraphNode[] {
  // Build reverse adjacency (which nodes depend on this one)
  const prerequisites = new Map<string, string[]>()
  nodes.forEach(n => prerequisites.set(n.id, []))
  edges.forEach(e => {
    const deps = prerequisites.get(e.target_id) || []
    deps.push(e.source_id)
    prerequisites.set(e.target_id, deps)
  })
  
  const suggestions: { node: GraphNode; priority: number }[] = []
  
  for (const node of nodes) {
    const progress = userProgress.get(node.id)
    
    // Skip completed nodes
    if (progress?.status === 'completed') continue
    
    // In-progress nodes are high priority
    if (progress?.status === 'in_progress') {
      suggestions.push({ node, priority: 100 })
      continue
    }
    
    // Check how many prerequisites are completed
    const prereqs = prerequisites.get(node.id) || []
    const completedPrereqs = prereqs.filter(p => 
      userProgress.get(p)?.status === 'completed'
    ).length
    
    // Unlocked nodes (all prereqs done)
    if (prereqs.length === 0 || completedPrereqs === prereqs.length) {
      // Prioritize by difficulty (easier first for beginners)
      suggestions.push({ node, priority: 50 - node.difficulty * 5 })
    }
    // Nearly unlocked (most prereqs done)
    else if (completedPrereqs >= prereqs.length * 0.7) {
      suggestions.push({ node, priority: 20 - node.difficulty * 2 })
    }
  }
  
  // Sort by priority and return top N
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(s => s.node)
}

/**
 * Calculate overall progress percentage for a graph
 */
export function calculateGraphProgress(
  nodes: GraphNode[],
  userProgress: Map<string, { status: ProgressStatus }>
): { percentage: number; completed: number; total: number } {
  const completed = nodes.filter(n => 
    userProgress.get(n.id)?.status === 'completed'
  ).length
  
  return {
    percentage: nodes.length > 0 ? Math.round((completed / nodes.length) * 100) : 0,
    completed,
    total: nodes.length,
  }
}
