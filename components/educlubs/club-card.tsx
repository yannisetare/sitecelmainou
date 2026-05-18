'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Users, CheckCircle2 } from 'lucide-react'
import type { EduClub } from '@/lib/types'

interface ClubCardProps {
  club: EduClub
  isJoined: boolean
  onJoin: () => void
}

export function ClubCard({ club, isJoined, onJoin }: ClubCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Math: 'bg-blue-500/20 text-blue-400',
      History: 'bg-amber-500/20 text-amber-400',
      Science: 'bg-green-500/20 text-green-400',
      Language: 'bg-purple-500/20 text-purple-400',
      Art: 'bg-pink-500/20 text-pink-400',
      Technology: 'bg-cyan-500/20 text-cyan-400',
    }
    return colors[category] || 'bg-muted text-muted-foreground'
  }

  return (
    <Card className={cn(
      "group transition-all hover:border-primary/50",
      isJoined && "border-primary bg-primary/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
              getCategoryColor(club.category)
            )}>
              {club.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {club.name}
              </h3>
              <Badge variant="secondary" className={cn("text-xs mt-1", getCategoryColor(club.category))}>
                {club.category}
              </Badge>
            </div>
          </div>
          {isJoined && (
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {club.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {club.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, club.member_count))].map((_, i) => (
                <Avatar key={i} className="w-6 h-6 border-2 border-card">
                  <AvatarFallback className="text-[10px] bg-muted">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {club.member_count} members
            </span>
          </div>
          
          {club.is_active && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          )}
        </div>

        <Button 
          onClick={onJoin}
          variant={isJoined ? "outline" : "default"}
          className="w-full"
        >
          {isJoined ? 'Open Chat' : 'Join Club'}
        </Button>
      </CardContent>
    </Card>
  )
}
