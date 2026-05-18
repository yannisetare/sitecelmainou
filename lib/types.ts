// Database types for EduWeb

export interface Profile {
  id: string
  email?: string
  display_name?: string | null
  full_name?: string | null
  avatar_url: string | null
  role: 'student' | 'teacher'
  created_at: string
  updated_at?: string
}

export interface Class {
  id: string
  name: string
  description: string | null
  join_code: string
  teacher_id: string
  created_at: string
  updated_at: string
  teacher?: Profile
  member_count?: number
}

export interface ClassMember {
  id: string
  class_id: string
  student_id: string
  joined_at: string
  student?: Profile
}

export interface Graph {
  id: string
  title: string
  description: string | null
  owner_id: string
  class_id: string | null
  is_template: boolean
  is_public?: boolean
  category?: string
  created_at: string
  updated_at: string
  owner?: Profile
  class?: Class
}

export interface NodeContent {
  markdown?: string
  video_url?: string
  quiz?: Quiz
  code?: CodePlayground
}

export interface Quiz {
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank'
  question: string
  options?: string[]
  correct_answer: string | number
  explanation?: string
}

export interface CodePlayground {
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css'
  template: string
  solution?: string
  test_cases?: string[]
}

export interface GraphNode {
  id: string
  graph_id: string
  label: string
  title?: string
  description: string | null
  node_type: string
  content_type: 'markdown' | 'video' | 'quiz' | 'code' | 'mixed' | null
  content: NodeContent
  position_x: number
  position_y: number
  position_z: number
  color: string | null
  size: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes?: number
  created_at: string
  updated_at: string
}

export interface Edge {
  id: string
  graph_id: string
  source_id: string
  target_id: string
  label: string | null
  weight: number
  created_at: string
}

export type ProgressStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed'

export interface UserProgress {
  id: string
  user_id: string
  node_id: string
  status: ProgressStatus
  score: number | null
  time_spent: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Graph visualization types
export interface ForceGraphNode {
  id: string
  label: string
  description: string | null
  status: ProgressStatus
  color?: string
  size?: number
  x?: number
  y?: number
  z?: number
  fx?: number | null
  fy?: number | null
  fz?: number | null
}

export interface ForceGraphLink {
  source: string | ForceGraphNode
  target: string | ForceGraphNode
  weight: number
}

export interface ForceGraphData {
  nodes: ForceGraphNode[]
  links: ForceGraphLink[]
}

// Pathfinding types
export interface PathNode {
  id: string
  g: number // Cost from start
  h: number // Heuristic (estimated cost to goal)
  f: number // Total cost (g + h)
  parent: string | null
}

// EduClubs types
export interface EduClub {
  id: string
  name: string
  description: string | null
  category: string
  cover_image: string | null
  member_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  user?: Profile
  current_node_id?: string | null
  is_online?: boolean
}

export interface ChatMessage {
  id: string
  club_id: string
  user_id: string
  content: string
  is_moderated: boolean
  created_at: string
  user?: Profile
}

// Upload types
export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
}

// Presence types for real-time tracking
export interface UserPresence {
  user_id: string
  user_name: string
  avatar_url: string | null
  node_id: string | null
  club_id: string | null
  is_online: boolean
  last_seen: string
}
