'use client'

import { useState, useEffect } from 'react'
import { useGraphStore } from '@/lib/store'
import { MarkdownContent } from './markdown-content'
import { VideoContent } from './video-content'
import { AdaptiveQuiz } from './adaptive-quiz'
import { CodeContent } from './code-content'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { X, Clock, Users, Lock, CheckCircle2, BookOpen, Video, Code, HelpCircle, Play, Sparkles } from 'lucide-react'

export function NodeContentPanel() {
  const { 
    selectedNode, 
    setSelectedNode, 
    getNodeStatus,
    updateNodeProgress,
    canAccessNode,
    presence,
    isContentPanelOpen,
  } = useGraphStore()

  const [activeTab, setActiveTab] = useState('learn')
  const [quizStarted, setQuizStarted] = useState(false)

  // Reset quiz state when node changes
  useEffect(() => {
    setQuizStarted(false)
    setActiveTab('learn')
  }, [selectedNode?.id])

  if (!selectedNode) return null

  const status = getNodeStatus(selectedNode.id)
  const isAccessible = canAccessNode(selectedNode.id)
  const content = selectedNode.content || {}
  const hasMarkdown = !!content.markdown
  const hasVideo = !!content.video_url
  const hasQuiz = !!content.quiz && content.quiz.questions && content.quiz.questions.length > 0
  const hasCode = !!content.code

  // Count active learners on this node
  const activeLearnersOnNode = presence?.filter(p => p.node_id === selectedNode.id) || []

  const handleStartLearning = () => {
    updateNodeProgress(selectedNode.id, 'in_progress')
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setActiveTab('quiz')
  }

  const handleQuizComplete = (score: number, passed: boolean) => {
    // Quiz completion is handled in AdaptiveQuiz component
    // which uses BFS/Dijkstra algorithms
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent/20 text-accent'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-500'
      case 'unlocked': return 'bg-primary/20 text-primary'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'learn': return <BookOpen className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'quiz': return <HelpCircle className="w-4 h-4" />
      case 'code': return <Code className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <Sheet open={isContentPanelOpen && !!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[420px] p-0 bg-card border-l border-border flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold text-card-foreground truncate text-left">
                {selectedNode.label}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className={cn("text-xs", getStatusColor(status))}>
                  {status === 'in_progress' ? 'În Progres' : 
                   status === 'completed' ? 'Completat' :
                   status === 'unlocked' ? 'Deblocat' : 'Blocat'}
                </Badge>
                {selectedNode.node_type && (
                  <Badge variant="outline" className="text-xs">
                    {selectedNode.node_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {selectedNode.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 text-left">
              {selectedNode.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{selectedNode.estimated_minutes || 10} min
            </span>
            {activeLearnersOnNode.length > 0 && (
              <span className="flex items-center gap-1.5 text-accent">
                <Users className="w-3.5 h-3.5" />
                {activeLearnersOnNode.length} învață acum
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Content tabs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {status === 'locked' ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Conținut Blocat</h3>
                <p className="text-sm text-muted-foreground">
                  Completează nodurile anterioare pentru a debloca acest conținut.
                </p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 mx-4 mt-4 h-10 shrink-0">
                {(hasMarkdown || (!hasMarkdown && !hasVideo && !hasQuiz && !hasCode)) && (
                  <TabsTrigger value="learn" className="gap-1.5 text-xs">
                    {getTabIcon('learn')}
                    <span className="hidden sm:inline">Învață</span>
                  </TabsTrigger>
                )}
                {hasVideo && (
                  <TabsTrigger value="video" className="gap-1.5 text-xs">
                    {getTabIcon('video')}
                    <span className="hidden sm:inline">Video</span>
                  </TabsTrigger>
                )}
                {hasQuiz && (
                  <TabsTrigger value="quiz" className="gap-1.5 text-xs relative">
                    {getTabIcon('quiz')}
                    <span className="hidden sm:inline">Test</span>
                    {status !== 'completed' && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                    )}
                  </TabsTrigger>
                )}
                {hasCode && (
                  <TabsTrigger value="code" className="gap-1.5 text-xs">
                    {getTabIcon('code')}
                    <span className="hidden sm:inline">Cod</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {(hasMarkdown || (!hasMarkdown && !hasVideo && !hasQuiz && !hasCode)) && (
                    <TabsContent value="learn" className="mt-0">
                      {hasMarkdown ? (
                        <MarkdownContent content={content.markdown!} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Conținutul nu este disponibil încă.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  )}
                  
                  {hasVideo && (
                    <TabsContent value="video" className="mt-0">
                      <VideoContent url={content.video_url!} />
                    </TabsContent>
                  )}
                  
                  {hasQuiz && (
                    <TabsContent value="quiz" className="mt-0">
                      {quizStarted ? (
                        <AdaptiveQuiz 
                          quiz={content.quiz!}
                          nodeId={selectedNode.id}
                          onComplete={handleQuizComplete}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                            <HelpCircle className="w-8 h-8 text-accent" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Pornește Testul
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                            Testul are {content.quiz!.questions.length} întrebări. 
                            Ai nevoie de 70% pentru a trece și a debloca concepte noi.
                          </p>
                          <Button onClick={handleStartQuiz} className="gap-2">
                            <Play className="w-4 h-4" />
                            Pornește Testul
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  )}
                  
                  {hasCode && (
                    <TabsContent value="code" className="mt-0">
                      <CodeContent code={content.code!} />
                    </TabsContent>
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          )}
        </div>

        {/* Footer actions */}
        {status !== 'locked' && activeTab === 'learn' && (
          <div className="p-4 border-t border-border shrink-0">
            {status === 'unlocked' && (
              <Button className="w-full" onClick={handleStartLearning}>
                Începe să Înveți
              </Button>
            )}
            {status === 'in_progress' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progres</span>
                  <span className="font-medium">În desfășurare</span>
                </div>
                <Progress value={50} className="h-2" />
                {hasQuiz && (
                  <Button className="w-full gap-2" onClick={handleStartQuiz}>
                    <Sparkles className="w-4 h-4" />
                    Începe Testul pentru a Completa
                  </Button>
                )}
              </div>
            )}
            {status === 'completed' && (
              <div className="flex items-center justify-center gap-2 py-2 text-accent">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Completat</span>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
