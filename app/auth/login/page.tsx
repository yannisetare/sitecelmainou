'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'
import { LanguageSelector } from '@/components/language-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle rate limit errors specifically
        if (error.message.toLowerCase().includes('rate limit') || 
            error.message.toLowerCase().includes('too many requests')) {
          setError(t('error.rateLimitExceeded'))
        } else {
          setError(error.message)
        }
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
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
            {t('auth.welcomeBack')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.login')}</CardTitle>
            <CardDescription>
              {t('auth.enterCredentials')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.login')}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.noAccount')}{' '}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  {t('auth.signup')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
