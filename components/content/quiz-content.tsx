'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Quiz, QuizQuestion } from '@/lib/types'

interface QuizContentProps {
  quiz: Quiz
  onComplete: (score: number) => void
}

export function QuizContent({ quiz, onComplete }: QuizContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string | number>>(new Map())
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())

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
      calculateAndShowResults()
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const calculateAndShowResults = () => {
    let correct = 0
    quiz.questions.forEach(q => {
      const answer = answers.get(q.id)
      if (answer !== undefined && answer.toString() === q.correct_answer.toString()) {
        correct++
      }
    })
    const score = Math.round((correct / quiz.questions.length) * 100)
    setShowResults(true)
    onComplete(score)
  }

  const isAnswerCorrect = (questionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId)
    const answer = answers.get(questionId)
    return answer !== undefined && answer.toString() === question?.correct_answer.toString()
  }

  if (showResults) {
    const correctCount = quiz.questions.filter(q => isAnswerCorrect(q.id)).length
    const score = Math.round((correctCount / quiz.questions.length) * 100)

    return (
      <div className="space-y-6">
        <Card className="bg-card/50">
          <CardContent className="pt-6 text-center">
            <div className={cn(
              "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
              score >= 70 ? "bg-accent/20" : "bg-destructive/20"
            )}>
              <span className={cn(
                "text-3xl font-bold",
                score >= 70 ? "text-accent" : "text-destructive"
              )}>
                {score}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {score >= 70 ? 'Great job!' : 'Keep practicing!'}
            </h3>
            <p className="text-muted-foreground">
              You got {correctCount} out of {quiz.questions.length} questions correct.
            </p>
          </CardContent>
        </Card>

        {/* Review answers */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Review</h4>
          {quiz.questions.map((q, i) => (
            <Card 
              key={q.id} 
              className={cn(
                "bg-card/50",
                isAnswerCorrect(q.id) ? "border-accent/50" : "border-destructive/50"
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                    isAnswerCorrect(q.id) ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                  )}>
                    {isAnswerCorrect(q.id) ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-2">{i + 1}. {q.question}</p>
                    <p className="text-xs text-muted-foreground">
                      Your answer: <span className={isAnswerCorrect(q.id) ? "text-accent" : "text-destructive"}>
                        {q.type === 'multiple_choice' && q.options 
                          ? q.options[Number(answers.get(q.id)) || 0]
                          : answers.get(q.id)?.toString() || 'No answer'}
                      </span>
                    </p>
                    {!isAnswerCorrect(q.id) && (
                      <p className="text-xs text-accent mt-1">
                        Correct: {q.type === 'multiple_choice' && q.options 
                          ? q.options[Number(q.correct_answer)]
                          : q.correct_answer}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            setCurrentIndex(0)
            setAnswers(new Map())
            setShowResults(false)
            setSubmitted(new Set())
          }}
        >
          Try Again
        </Button>
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
            Question {currentIndex + 1} of {quiz.questions.length}
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
              placeholder="Type your answer..."
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
                <span className="font-medium text-foreground">Explanation:</span>{' '}
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
            Check Answer
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleNext}>
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  )
}
