'use client'

import { useState } from 'react'
import { useGraphStore } from '@/lib/store'
import { ClubCard } from './club-card'
import { ClubChat } from './club-chat'
import { ProgressMap } from './progress-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Search, Plus, Users, MessageSquare, Map } from 'lucide-react'
import type { EduClub } from '@/lib/types'

// Mock data for demonstration
const mockClubs: EduClub[] = [
  {
    id: '1',
    name: 'Advanced Mathematics',
    description: 'Study group for calculus, linear algebra, and beyond',
    category: 'Math',
    cover_image: null,
    member_count: 24,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'History Buffs',
    description: 'Explore world history together through interactive graphs',
    category: 'History',
    cover_image: null,
    member_count: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Science Explorers',
    description: 'Physics, chemistry, and biology learning community',
    category: 'Science',
    cover_image: null,
    member_count: 31,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function EduClubsView() {
  const { currentClub, setCurrentClub, user } = useGraphStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('clubs')

  const filteredClubs = mockClubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleJoinClub = (club: EduClub) => {
    setCurrentClub(club)
    setActiveTab('chat')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tabs Header */}
        <div className="border-b border-border px-4 py-3 bg-card/50">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="clubs" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clubs</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" disabled={!currentClub}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2" disabled={!currentClub}>
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Clubs Discovery Tab */}
        <TabsContent value="clubs" className="flex-1 mt-0 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-border">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search study crews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Club</span>
                </Button>
              </div>
            </div>

            {/* Clubs Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredClubs.map(club => (
                    <ClubCard 
                      key={club.id} 
                      club={club} 
                      isJoined={currentClub?.id === club.id}
                      onJoin={() => handleJoinClub(club)}
                    />
                  ))}
                </div>

                {filteredClubs.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium text-foreground mb-2">No clubs found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ? 'Try a different search term' : 'Be the first to create a study club!'}
                    </p>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Club
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
          {currentClub ? (
            <ClubChat club={currentClub} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Join a club to start chatting</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Progress Map Tab */}
        <TabsContent value="progress" className="flex-1 mt-0 overflow-hidden">
          {currentClub ? (
            <ProgressMap club={currentClub} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Join a club to see progress</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
