'use client'

import { useState, useMemo } from 'react'
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
import { Search, Plus, Users, MessageSquare, Map, Globe } from 'lucide-react'
import type { EduClub } from '@/lib/types'

// Extended mock data with language property
interface EduClubWithLang extends EduClub {
  language: 'ro' | 'en'
}

const mockClubs: EduClubWithLang[] = [
  {
    id: '1',
    name: 'Matematică Avansată',
    description: 'Grup de studiu pentru calcul, algebră liniară și mai mult',
    category: 'Math',
    cover_image: null,
    member_count: 24,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'ro',
  },
  {
    id: '2',
    name: 'Istorie și Civilizații',
    description: 'Explorează istoria lumii împreună prin grafuri interactive',
    category: 'History',
    cover_image: null,
    member_count: 18,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'ro',
  },
  {
    id: '3',
    name: 'Știință și Descoperiri',
    description: 'Comunitate de învățare pentru fizică, chimie și biologie',
    category: 'Science',
    cover_image: null,
    member_count: 31,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'ro',
  },
  {
    id: '4',
    name: 'Advanced Mathematics',
    description: 'Study group for calculus, linear algebra, and beyond',
    category: 'Math',
    cover_image: null,
    member_count: 42,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'en',
  },
  {
    id: '5',
    name: 'History Explorers',
    description: 'Explore world history together through interactive knowledge graphs',
    category: 'History',
    cover_image: null,
    member_count: 28,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'en',
  },
  {
    id: '6',
    name: 'Science Club',
    description: 'Physics, chemistry, and biology learning community',
    category: 'Science',
    cover_image: null,
    member_count: 35,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'en',
  },
  {
    id: '7',
    name: 'Programare și Tehnologie',
    description: 'Învață programare de la zero cu suport în limba română',
    category: 'Technology',
    cover_image: null,
    member_count: 56,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'ro',
  },
  {
    id: '8',
    name: 'Programming & Tech',
    description: 'Learn programming from scratch with community support',
    category: 'Technology',
    cover_image: null,
    member_count: 67,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    language: 'en',
  },
]

export function EduClubsView() {
  const { currentClub, setCurrentClub, user } = useGraphStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('clubs')
  const [languageFilter, setLanguageFilter] = useState<'ro' | 'en'>('ro')

  // Filter clubs by language and search query
  const filteredClubs = useMemo(() => {
    return mockClubs
      .filter(club => club.language === languageFilter)
      .filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [languageFilter, searchQuery])

  // Count clubs by language
  const roCount = mockClubs.filter(c => c.language === 'ro').length
  const enCount = mockClubs.filter(c => c.language === 'en').length

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
              <span className="hidden sm:inline">Cluburi</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2" disabled={!currentClub}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2" disabled={!currentClub}>
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Progres</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Clubs Discovery Tab */}
        <TabsContent value="clubs" className="flex-1 mt-0 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Language Filter Tabs - RO/EN */}
            <div className="px-4 pt-4">
              <Tabs value={languageFilter} onValueChange={(v) => setLanguageFilter(v as 'ro' | 'en')}>
                <TabsList className="grid w-full max-w-xs grid-cols-2 h-9">
                  <TabsTrigger value="ro" className="gap-2 text-sm">
                    <span className="font-medium">Română</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary">
                      {roCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="en" className="gap-2 text-sm">
                    <span className="font-medium">English</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary">
                      {enCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={languageFilter === 'ro' ? 'Caută grupuri de studiu...' : 'Search study crews...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button className="gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {languageFilter === 'ro' ? 'Creează Club' : 'Create Club'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Clubs Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {languageFilter === 'ro' 
                      ? `${filteredClubs.length} cluburi în limba română` 
                      : `${filteredClubs.length} clubs in English`}
                  </h3>
                </div>

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
                    <h3 className="font-medium text-foreground mb-2">
                      {languageFilter === 'ro' ? 'Niciun club găsit' : 'No clubs found'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery 
                        ? (languageFilter === 'ro' ? 'Încearcă un alt termen de căutare' : 'Try a different search term')
                        : (languageFilter === 'ro' ? 'Fii primul care creează un club!' : 'Be the first to create a study club!')}
                    </p>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      {languageFilter === 'ro' ? 'Creează Club' : 'Create Club'}
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
                <p className="text-muted-foreground">
                  {languageFilter === 'ro' 
                    ? 'Alătură-te unui club pentru a începe să conversezi'
                    : 'Join a club to start chatting'}
                </p>
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
                <p className="text-muted-foreground">
                  {languageFilter === 'ro' 
                    ? 'Alătură-te unui club pentru a vedea progresul'
                    : 'Join a club to see progress'}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
