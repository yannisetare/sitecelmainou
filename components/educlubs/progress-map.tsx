'use client'

import { useGraphStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { BookOpen, CheckCircle2, PlayCircle, Lock } from 'lucide-react'
import type { EduClub, ClubMember } from '@/lib/types'

interface ProgressMapProps {
  club: EduClub
}

// Mock classmate progress data
const mockClassmateProgress: Array<{
  member: ClubMember
  completedNodes: number
  totalNodes: number
  currentNodeLabel: string
  isActive: boolean
}> = [
  {
    member: { id: '1', club_id: '1', user_id: 'user1', role: 'admin', joined_at: '', user: { id: 'user1', display_name: 'Alice Chen', avatar_url: null, role: 'student', created_at: '' }, is_online: true },
    completedNodes: 8,
    totalNodes: 12,
    currentNodeLabel: 'Integration by Parts',
    isActive: true,
  },
  {
    member: { id: '2', club_id: '1', user_id: 'user2', role: 'member', joined_at: '', user: { id: 'user2', display_name: 'Bob Smith', avatar_url: null, role: 'student', created_at: '' }, is_online: true },
    completedNodes: 5,
    totalNodes: 12,
    currentNodeLabel: 'Chain Rule',
    isActive: true,
  },
  {
    member: { id: '3', club_id: '1', user_id: 'user3', role: 'member', joined_at: '', user: { id: 'user3', display_name: 'Carol Davis', avatar_url: null, role: 'student', created_at: '' }, is_online: false },
    completedNodes: 10,
    totalNodes: 12,
    currentNodeLabel: 'Taylor Series',
    isActive: false,
  },
  {
    member: { id: '4', club_id: '1', user_id: 'user4', role: 'member', joined_at: '', user: { id: 'user4', display_name: 'David Kim', avatar_url: null, role: 'student', created_at: '' }, is_online: true },
    completedNodes: 3,
    totalNodes: 12,
    currentNodeLabel: 'Limits',
    isActive: true,
  },
  {
    member: { id: '5', club_id: '1', user_id: 'user5', role: 'member', joined_at: '', user: { id: 'user5', display_name: 'Eva Martinez', avatar_url: null, role: 'student', created_at: '' }, is_online: false },
    completedNodes: 12,
    totalNodes: 12,
    currentNodeLabel: 'Completed!',
    isActive: false,
  },
]

export function ProgressMap({ club }: ProgressMapProps) {
  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'text-primary'
    if (percent >= 50) return 'text-yellow-500'
    return 'text-blue-400'
  }

  const getStatusIcon = (completedNodes: number, totalNodes: number) => {
    if (completedNodes === totalNodes) return <CheckCircle2 className="w-4 h-4 text-primary" />
    if (completedNodes > 0) return <PlayCircle className="w-4 h-4 text-yellow-500" />
    return <Lock className="w-4 h-4 text-muted-foreground" />
  }

  // Sort by progress (most progress first)
  const sortedProgress = [...mockClassmateProgress].sort(
    (a, b) => (b.completedNodes / b.totalNodes) - (a.completedNodes / a.totalNodes)
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-foreground">Classmate Progress</h2>
          <p className="text-xs text-muted-foreground">Track how your study crew is doing</p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <BookOpen className="w-3 h-3" />
          {club.member_count} members
        </Badge>
      </div>

      {/* Progress List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedProgress.map((item, index) => {
            const percent = Math.round((item.completedNodes / item.totalNodes) * 100)
            
            return (
              <div 
                key={item.member.id}
                className={cn(
                  "p-4 rounded-xl border border-border bg-card/50 transition-all",
                  item.isActive && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                    index === 0 && "bg-yellow-500/20 text-yellow-500",
                    index === 1 && "bg-muted text-muted-foreground",
                    index === 2 && "bg-amber-600/20 text-amber-600",
                    index > 2 && "bg-muted/50 text-muted-foreground"
                  )}>
                    #{index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={item.member.user?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted">
                        {item.member.user?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {item.isActive && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate">
                        {item.member.user?.display_name}
                      </span>
                      <span className={cn("text-sm font-bold", getProgressColor(percent))}>
                        {percent}%
                      </span>
                    </div>
                    
                    <Progress value={percent} className="h-2 mt-2" />
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getStatusIcon(item.completedNodes, item.totalNodes)}
                        <span>{item.completedNodes}/{item.totalNodes} nodes</span>
                      </div>
                      {item.isActive && (
                        <span className="text-xs text-primary">
                          Learning: {item.currentNodeLabel}
                        </span>
                      )}
                      {!item.isActive && item.completedNodes === item.totalNodes && (
                        <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="border-t border-border p-4 bg-card/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {sortedProgress.filter(p => p.isActive).length}
            </div>
            <div className="text-xs text-muted-foreground">Active Now</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(sortedProgress.reduce((acc, p) => acc + (p.completedNodes / p.totalNodes) * 100, 0) / sortedProgress.length)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {sortedProgress.filter(p => p.completedNodes === p.totalNodes).length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
