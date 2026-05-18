'use client'

import { useState, useEffect } from 'react'
import { useGraphStore } from '@/lib/store'
import { bfsUnlockAdjacentNodes, dijkstraRecoveryPath } from '@/lib/pathfinding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, ArrowRight, RotateCcw, BookOpen } from 'lucide-react'
import type { Quiz, QuizQuestion, GraphNode } from '@/lib/types'

interface AdaptiveQuizProps {
  quiz: Quiz
  nodeId: string
  onComplete: (score: number, passed: boolean) => void
}

const PASSING_SCORE = 70

export function AdaptiveQuiz({ quiz, nodeId, onComplete }: AdaptiveQuizProps) {
  const { 
    nodes, 
    edges, 
    userProgress, 
    updateNodeProgress,
    setSelectedNode,
  } = useGraphStore()
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string | number>>(new Map())
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [quizResult, setQuizResult] = useState<{
    passed: boolean
    score: number
    unlockedNodes: GraphNode[]
    remedialNodes: GraphNode[]
    remedialMessage: string
  } | null>(null)

  const currentQuestion = quiz.questions[currentIndex]
  const isLastQuestion = currentIndex === quiz.questions.length - 1
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100

  const handleAnswer = (value: string | number) => {
    const newAnswers = new Map(answers)
    newAnswers.set(currentQuestion.id, value)
    setAnswers(newAnswers)
  }

  const handleSubmitAnswer = () => {
    const newSubmitted = new Set(submitted)
    newSubmitted.add(currentQuestion.id)
    setSubmitted(newSubmitted)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      calculateResults()
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const isAnswerCorrect = (questionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId)
    const answer = answers.get(questionId)
    return answer !== undefined && answer.toString() === question?.correct_answer.toString()
  }

  const calculateResults = () => {
    const correctCount = quiz.questions.filter(q => isAnswerCorrect(q.id)).length
    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = score >= PASSING_SCORE

    if (passed) {
      // SUCCESS: Use BFS to unlock adjacent nodes
      const unlockedNodeIds = bfsUnlockAdjacentNodes(nodes, edges, nodeId)
      const unlockedNodes = unlockedNodeIds
        .map(id => nodes.find(n => n.id === id))
        .filter((n): n is GraphNode => n !== undefined)
      
      // Update progress for unlocked nodes
      unlockedNodeIds.forEach(id => {
        const currentProgress = userProgress.get(id)
        if (!currentProgress || currentProgress.status === 'locked') {
          updateNodeProgress(id, 'unlocked')
        }
      })
      
      // Mark current node as completed
      updateNodeProgress(nodeId, 'completed', score)
      
      setQuizResult({
        passed: true,
        score,
        unlockedNodes,
        remedialNodes: [],
        remedialMessage: ''
      })
    } else {
      // FAILURE: Use Dijkstra to find recovery path
      const { remedialPath, message } = dijkstraRecoveryPath(
        nodes,
        edges,
        userProgress,
        nodeId
      )
      
      setQuizResult({
        passed: false,
        score,
        unlockedNodes: [],
        remedialNodes: remedialPath,
        remedialMessage: message
      })
    }

    setShowResults(true)
    onComplete(score, passed)
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setAnswers(new Map())
    setShowResults(false)
    setSubmitted(new Set())
    setQuizResult(null)
  }

  const handleGoToNode = (node: GraphNode) => {
    setSelectedNode(node)
  }

  // Results screen
  if (showResults && quizResult) {
    return (
      <div className="space-y-6">
        {/* Score Card */}
        <Card className={cn(
          "bg-card/50 border-2",
          quizResult.passed ? "border-accent/50" : "border-destructive/50"
        )}>
          <CardContent className="pt-6 text-center">
            <div className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              quizResult.passed ? "bg-accent/20" : "bg-destructive/20"
            )}>
              {quizResult.passed ? (
                <CheckCircle2 className="w-10 h-10 text-accent" />
              ) : (
                <XCircle className="w-10 h-10 text-destructive" />
              )}
            </div>
            <div className={cn(
              "text-4xl font-bold mb-2",
              quizResult.passed ? "text-accent" : "text-destructive"
            )}>
              {quizResult.score}%
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {quizResult.passed ? 'Felicitari!' : 'Mai incearca!'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {quizResult.passed 
                ? `Ai completat cu succes acest concept. ${quizResult.unlockedNodes.length > 0 ? 'Noi concepte au fost deblocate!' : ''}`
                : `Ai nevoie de ${PASSING_SCORE}% pentru a trece. Revizuiește materialul și încearcă din nou.`
              }
            </p>
          </CardContent>
        </Card>

        {/* Success: Unlocked Nodes */}
        {quizResult.passed && quizResult.unlockedNodes.length > 0 && (
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">Concepte Deblocate</h4>
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  +{quizResult.unlockedNodes.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {quizResult.unlockedNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleGoToNode(node)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors group"
                  >
                    <div className="text-left">
                      <div className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {node.label}
                      </div>
                      {node.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {node.description}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failure: Remedial Suggestions */}
        {!quizResult.passed && quizResult.remedialNodes.length > 0 && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <AlertTitle className="text-yellow-500">Sugestii de Recuperare</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {quizResult.remedialMessage}
            </AlertDescription>
          </Alert>
        )}

        {!quizResult.passed && quizResult.remedialNodes.length > 0 && (
          <Card className="bg-card/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-medium text-foreground">Concepte de Revizuit</h4>
              </div>
              <div className="space-y-2">
                {quizResult.remedialNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleGoToNode(node)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="text-left">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {node.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dificultate: {node.size || 1}/5
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!quizResult.passed && (
            <Button onClick={handleRetry} variant="outline" className="flex-1 gap-2">
              <RotateCcw className="w-4 h-4" />
              Incearca din nou
            </Button>
          )}
          {quizResult.passed && quizResult.unlockedNodes.length > 0 && (
            <Button 
              onClick={() => handleGoToNode(quizResult.unlockedNodes[0])} 
              className="flex-1 gap-2"
            >
              Urmatorul Concept
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  const currentAnswer = answers.get(currentQuestion.id)
  const isSubmitted = submitted.has(currentQuestion.id)

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Întrebarea {currentIndex + 1} din {quiz.questions.length}
          </span>
          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="bg-card/50">
        <CardContent className="pt-6">
          <p className="text-foreground font-medium mb-4">
            {currentQuestion.question}
          </p>

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <RadioGroup 
              value={currentAnswer?.toString()} 
              onValueChange={(v) => handleAnswer(Number(v))}
              className="space-y-3"
              disabled={isSubmitted}
            >
              {currentQuestion.options.map((option, i) => {
                const isCorrectOption = i === Number(currentQuestion.correct_answer)
                const isSelectedOption = currentAnswer === i
                
                return (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                      isSubmitted && isCorrectOption && "border-accent bg-accent/10",
                      isSubmitted && isSelectedOption && !isCorrectOption && "border-destructive bg-destructive/10",
                      !isSubmitted && "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                    <Label 
                      htmlFor={`option-${i}`} 
                      className={cn(
                        "flex-1 cursor-pointer text-sm",
                        isSubmitted && isCorrectOption && "text-accent",
                        isSubmitted && isSelectedOption && !isCorrectOption && "text-destructive"
                      )}
                    >
                      {option}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          )}

          {currentQuestion.type === 'true_false' && (
            <RadioGroup 
              value={currentAnswer?.toString()} 
              onValueChange={handleAnswer}
              className="space-y-3"
              disabled={isSubmitted}
            >
              {['True', 'False'].map((option) => {
                const isCorrectOption = option.toLowerCase() === currentQuestion.correct_answer.toString().toLowerCase()
                const isSelectedOption = currentAnswer === option
                
                return (
                  <div 
                    key={option}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                      isSubmitted && isCorrectOption && "border-accent bg-accent/10",
                      isSubmitted && isSelectedOption && !isCorrectOption && "border-destructive bg-destructive/10",
                      !isSubmitted && "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={option} id={`option-${option}`} />
                    <Label 
                      htmlFor={`option-${option}`} 
                      className={cn(
                        "flex-1 cursor-pointer text-sm",
                        isSubmitted && isCorrectOption && "text-accent",
                        isSubmitted && isSelectedOption && !isCorrectOption && "text-destructive"
                      )}
                    >
                      {option}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <Input
              value={currentAnswer?.toString() || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Scrie răspunsul tău..."
              disabled={isSubmitted}
              className={cn(
                isSubmitted && isAnswerCorrect(currentQuestion.id) && "border-accent",
                isSubmitted && !isAnswerCorrect(currentQuestion.id) && "border-destructive"
              )}
            />
          )}

          {/* Feedback after submission */}
          {isSubmitted && currentQuestion.explanation && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Explicație:</span>{' '}
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {!isSubmitted ? (
          <Button 
            className="flex-1" 
            onClick={handleSubmitAnswer}
            disabled={currentAnswer === undefined}
          >
            Verifică Răspunsul
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleNext}>
            {isLastQuestion ? 'Vezi Rezultatele' : 'Următoarea Întrebare'}
          </Button>
        )}
      </div>
    </div>
  )
}
