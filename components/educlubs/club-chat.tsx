'use client'

import { useState, useRef, useEffect } from 'react'
import { useGraphStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Send, AlertTriangle, Users, X } from 'lucide-react'
import type { EduClub, ChatMessage, ClubMember } from '@/lib/types'

interface ClubChatProps {
  club: EduClub
}

// Toxic word detection (basic example)
const TOXIC_WORDS = ['hate', 'stupid', 'idiot', 'dumb']

function containsToxicContent(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return TOXIC_WORDS.some(word => lowerMessage.includes(word))
}

// Mock messages
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    club_id: '1',
    user_id: 'user1',
    content: 'Hey everyone! Anyone working on the calculus problems?',
    is_moderated: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: { id: 'user1', display_name: 'Alice Chen', avatar_url: null, role: 'student', created_at: '' },
  },
  {
    id: '2',
    club_id: '1',
    user_id: 'user2',
    content: 'Yes! I am stuck on the integration by parts section. The graph visualization really helps though.',
    is_moderated: false,
    created_at: new Date(Date.now() - 3000000).toISOString(),
    user: { id: 'user2', display_name: 'Bob Smith', avatar_url: null, role: 'student', created_at: '' },
  },
  {
    id: '3',
    club_id: '1',
    user_id: 'user3',
    content: 'I can help! Let me share my notes from the completed nodes.',
    is_moderated: false,
    created_at: new Date(Date.now() - 2400000).toISOString(),
    user: { id: 'user3', display_name: 'Carol Davis', avatar_url: null, role: 'student', created_at: '' },
  },
]

// Mock online members
const mockOnlineMembers: ClubMember[] = [
  { id: '1', club_id: '1', user_id: 'user1', role: 'admin', joined_at: '', user: { id: 'user1', display_name: 'Alice Chen', avatar_url: null, role: 'student', created_at: '' }, is_online: true },
  { id: '2', club_id: '1', user_id: 'user2', role: 'member', joined_at: '', user: { id: 'user2', display_name: 'Bob Smith', avatar_url: null, role: 'student', created_at: '' }, is_online: true },
  { id: '3', club_id: '1', user_id: 'user3', role: 'member', joined_at: '', user: { id: 'user3', display_name: 'Carol Davis', avatar_url: null, role: 'student', created_at: '' }, is_online: false },
]

export function ClubChat({ club }: ClubChatProps) {
  const { user, chatMessages, addChatMessage } = useGraphStore()
  const [message, setMessage] = useState('')
  const [moderationAlert, setModerationAlert] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Combine mock messages with store messages
  const allMessages = [...mockMessages, ...chatMessages.filter(m => m.club_id === club.id)]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  const handleSend = () => {
    if (!message.trim()) return

    // Check for toxic content
    if (containsToxicContent(message)) {
      setModerationAlert('Message blocked: inappropriate content detected. Please keep conversations respectful.')
      setTimeout(() => setModerationAlert(null), 5000)
      return
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      club_id: club.id,
      user_id: user?.id || 'current-user',
      content: message.trim(),
      is_moderated: false,
      created_at: new Date().toISOString(),
      user: user || { id: 'current-user', display_name: 'You', avatar_url: null, role: 'student', created_at: '' },
    }

    addChatMessage(newMessage)
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const onlineMembers = mockOnlineMembers.filter(m => m.is_online)

  return (
    <div className="h-full flex">
      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
              {club.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{club.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {onlineMembers.length} online
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMembers(!showMembers)}
            className={cn(showMembers && "bg-muted")}
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>

        {/* Moderation Alert */}
        {moderationAlert && (
          <Alert variant="destructive" className="m-4 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              {moderationAlert}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setModerationAlert(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {allMessages.map((msg) => {
              const isCurrentUser = msg.user_id === user?.id || msg.user_id === 'current-user'
              
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    isCurrentUser && "flex-row-reverse"
                  )}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={msg.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-muted">
                      {msg.user?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "flex flex-col max-w-[70%]",
                    isCurrentUser && "items-end"
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {isCurrentUser ? 'You' : msg.user?.display_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm",
                      isCurrentUser 
                        ? "bg-primary text-primary-foreground rounded-br-sm" 
                        : "bg-muted text-foreground rounded-bl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-64 border-l border-border bg-card/50 hidden md:block">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-foreground">Members</h3>
            <p className="text-xs text-muted-foreground">{club.member_count} total</p>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                Online - {onlineMembers.length}
              </div>
              {mockOnlineMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-muted">
                        {member.user?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card",
                      member.is_online ? "bg-green-500" : "bg-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {member.user?.display_name}
                    </div>
                    {member.role !== 'member' && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {member.role}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
