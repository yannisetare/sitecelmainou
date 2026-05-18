'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'
import { LanguageSelector } from '@/components/language-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: displayName || email.split('@')[0],
            role,
          },
        },
      })

      if (error) {
        // Handle rate limit errors specifically
        if (error.message.toLowerCase().includes('rate limit') || 
            error.message.toLowerCase().includes('too many requests') ||
            error.message.toLowerCase().includes('email rate limit')) {
          setError(t('error.emailRateLimit'))
        } else {
          setError(error.message)
        }
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{t('auth.checkEmail')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                className="w-8 h-8 text-accent"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">
              {t('auth.confirmationSent')} <strong className="text-foreground">{email}</strong>. 
              {' '}{t('auth.checkInbox')}
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                {t('auth.backToSignIn')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-primary-foreground"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="5" cy="6" r="2" />
                <circle cx="19" cy="6" r="2" />
                <circle cx="5" cy="18" r="2" />
                <circle cx="19" cy="18" r="2" />
                <line x1="9.5" y1="10" x2="6.5" y2="7.5" />
                <line x1="14.5" y1="10" x2="17.5" y2="7.5" />
                <line x1="9.5" y1="14" x2="6.5" y2="16.5" />
                <line x1="14.5" y1="14" x2="17.5" y2="16.5" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">EduWeb</span>
          </Link>
          <p className="text-muted-foreground">
            {t('auth.createJourney')}
          </p>
        </div>

        <Card>
          <CardHeader>
            {/* Role toggle buttons at top */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all",
                  role === 'student' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GraduationCap className="w-5 h-5" />
                {t('auth.student')}
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all",
                  role === 'teacher' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="w-5 h-5" />
                {t('auth.teacher')}
              </button>
            </div>
            <CardTitle>{t('auth.signup')}</CardTitle>
            <CardDescription>
              {role === 'student' ? t('auth.exploreGraphs') : t('auth.createClassrooms')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('auth.displayName')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.creatingAccount') : t('auth.signup')}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.hasAccount')}{' '}
                <Link href="/auth/login" className="text-primary hover:underline">
                  {t('auth.login')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
