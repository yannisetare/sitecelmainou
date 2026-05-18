'use client'

import { useGraphStore } from '@/lib/store'
import { NodeContentPanel } from '@/components/content/node-content-panel'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Lock, Unlock, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import type { GraphNode } from '@/lib/types'

interface MobileNodeAccordionProps {
  nodes: GraphNode[]
}

export function MobileNodeAccordion({ nodes }: MobileNodeAccordionProps) {
  const { 
    getNodeStatus, 
    canAccessNode, 
    selectedNode, 
    setSelectedNode,
    isContentPanelOpen,
    userProgress,
  } = useGraphStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-primary" />
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-yellow-500" />
      case 'unlocked':
        return <Unlock className="w-5 h-5 text-blue-400" />
      default:
        return <Lock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-0">In Progress</Badge>
      case 'unlocked':
        return <Badge className="bg-blue-500/20 text-blue-400 border-0">Unlocked</Badge>
      default:
        return <Badge variant="secondary" className="text-muted-foreground">Locked</Badge>
    }
  }

  // Sort nodes: completed first, then in_progress, unlocked, locked
  const sortedNodes = [...nodes].sort((a, b) => {
    const statusOrder = { completed: 0, in_progress: 1, unlocked: 2, locked: 3 }
    const statusA = getNodeStatus(a.id)
    const statusB = getNodeStatus(b.id)
    return (statusOrder[statusA] || 3) - (statusOrder[statusB] || 3)
  })

  const handleNodeClick = (node: GraphNode) => {
    if (canAccessNode(node.id)) {
      setSelectedNode(node)
    }
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {/* Progress Summary */}
          <div className="p-4 bg-card rounded-xl border border-border mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {nodes.filter(n => getNodeStatus(n.id) === 'completed').length}/{nodes.length} completed
              </span>
            </div>
            <Progress 
              value={(nodes.filter(n => getNodeStatus(n.id) === 'completed').length / nodes.length) * 100} 
              className="h-2"
            />
          </div>

          {/* Nodes Accordion */}
          <Accordion type="single" collapsible className="space-y-2">
            {sortedNodes.map((node, index) => {
              const status = getNodeStatus(node.id)
              const isAccessible = canAccessNode(node.id)
              
              return (
                <AccordionItem 
                  key={node.id} 
                  value={node.id}
                  className={cn(
                    "border border-border rounded-xl overflow-hidden transition-colors",
                    status === 'completed' && "border-primary/30 bg-primary/5",
                    status === 'in_progress' && "border-yellow-500/30 bg-yellow-500/5",
                    !isAccessible && "opacity-60"
                  )}
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {node.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {node.node_type || 'Concept'}
                        </div>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="pt-2 space-y-3">
                      {node.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {node.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{node.content_type || 'mixed'} content</span>
                        {node.content?.quiz && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span>{node.content.quiz.questions?.length || 0} quiz questions</span>
                          </>
                        )}
                      </div>

                      <Button
                        onClick={() => handleNodeClick(node)}
                        disabled={!isAccessible}
                        className="w-full mt-2"
                        variant={status === 'completed' ? 'outline' : 'default'}
                      >
                        {status === 'completed' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start Learning'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {nodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No concepts in this graph yet.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Mobile Content Panel Sheet */}
      <Sheet open={isContentPanelOpen && !!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-2xl">
          <NodeContentPanel />
        </SheetContent>
      </Sheet>
    </>
  )
}
