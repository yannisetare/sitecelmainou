'use client'

import { useState } from 'react'
import { useGraphStore } from '@/lib/store'
import { MarkdownContent } from './markdown-content'
import { VideoContent } from './video-content'
import { QuizContent } from './quiz-content'
import { CodeContent } from './code-content'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { X, Clock, Users, Lock, CheckCircle2, BookOpen, Video, Code, HelpCircle } from 'lucide-react'

export function NodeContentPanel() {
  const { 
    selectedNode, 
    setSelectedNode, 
    getNodeStatus,
    updateNodeProgress,
    canAccessNode,
    presence,
  } = useGraphStore()

  const [activeTab, setActiveTab] = useState('learn')

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

  const handleComplete = () => {
    updateNodeProgress(selectedNode.id, 'completed', 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary/20 text-primary'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-500'
      case 'unlocked': return 'bg-blue-500/20 text-blue-400'
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
    <aside className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border flex flex-col z-20">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-card-foreground truncate">
              {selectedNode.label}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="secondary" className={cn("text-xs", getStatusColor(status))}>
                {status.replace('_', ' ')}
              </Badge>
              {selectedNode.node_type && (
                <Badge variant="outline" className="text-xs">
                  {selectedNode.node_type}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedNode(null)}
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {selectedNode.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {selectedNode.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            ~10 min
          </span>
          {activeLearnersOnNode.length > 0 && (
            <span className="flex items-center gap-1.5 text-primary">
              <Users className="w-3.5 h-3.5" />
              {activeLearnersOnNode.length} learning now
            </span>
          )}
        </div>
      </div>

      {/* Content tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {status === 'locked' ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Locked Content</h3>
              <p className="text-sm text-muted-foreground">
                Complete the prerequisite nodes to unlock this content.
              </p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 mx-4 mt-4 h-10">
              {hasMarkdown && (
                <TabsTrigger value="learn" className="gap-1.5 text-xs">
                  {getTabIcon('learn')}
                  <span className="hidden sm:inline">Learn</span>
                </TabsTrigger>
              )}
              {hasVideo && (
                <TabsTrigger value="video" className="gap-1.5 text-xs">
                  {getTabIcon('video')}
                  <span className="hidden sm:inline">Video</span>
                </TabsTrigger>
              )}
              {hasQuiz && (
                <TabsTrigger value="quiz" className="gap-1.5 text-xs">
                  {getTabIcon('quiz')}
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
              )}
              {hasCode && (
                <TabsTrigger value="code" className="gap-1.5 text-xs">
                  {getTabIcon('code')}
                  <span className="hidden sm:inline">Code</span>
                </TabsTrigger>
              )}
              {!hasMarkdown && !hasVideo && !hasQuiz && !hasCode && (
                <TabsTrigger value="learn" className="gap-1.5 text-xs">
                  {getTabIcon('learn')}
                  Learn
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4">
              {hasMarkdown && (
                <TabsContent value="learn" className="mt-0 h-full">
                  <MarkdownContent content={content.markdown!} />
                </TabsContent>
              )}
              
              {hasVideo && (
                <TabsContent value="video" className="mt-0 h-full">
                  <VideoContent url={content.video_url!} />
                </TabsContent>
              )}
              
              {hasQuiz && (
                <TabsContent value="quiz" className="mt-0 h-full">
                  <QuizContent 
                    quiz={content.quiz!} 
                    onComplete={(score) => updateNodeProgress(selectedNode.id, 'completed', score)}
                  />
                </TabsContent>
              )}
              
              {hasCode && (
                <TabsContent value="code" className="mt-0 h-full">
                  <CodeContent code={content.code!} />
                </TabsContent>
              )}

              {!hasMarkdown && !hasVideo && !hasQuiz && !hasCode && (
                <TabsContent value="learn" className="mt-0">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No content available yet.
                    </p>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        )}
      </div>

      {/* Footer actions */}
      {status !== 'locked' && (
        <div className="p-4 border-t border-border">
          {status === 'unlocked' && (
            <Button className="w-full" onClick={handleStartLearning}>
              Start Learning
            </Button>
          )}
          {status === 'in_progress' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">In progress</span>
              </div>
              <Progress value={50} className="h-2" />
              <Button className="w-full" onClick={handleComplete}>
                Mark as Complete
              </Button>
            </div>
          )}
          {status === 'completed' && (
            <div className="flex items-center justify-center gap-2 py-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
