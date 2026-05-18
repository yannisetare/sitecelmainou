'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import { LanguageSelector } from '@/components/language-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function HomeClient() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        {/* Navigation */}
        <nav className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
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
            <span className="text-xl font-bold text-foreground">EduWeb</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/auth/login">
              <Button variant="ghost">{t('nav.signIn')}</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>{t('nav.getStarted')}</Button>
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="text-xs font-medium text-primary">{t('hero.badge.new')}</span>
            <span className="text-xs text-muted-foreground">{t('hero.badge.text')}</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground max-w-4xl mx-auto leading-tight text-balance">
            {t('hero.title')}{' '}
            <span className="text-primary">{t('hero.titleHighlight')}</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            {t('hero.description')}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                {t('hero.cta.primary')}
                <svg viewBox="0 0 24 24" className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="/auth/sign-up?role=teacher">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('hero.cta.secondary')}
              </Button>
            </Link>
          </div>

          {/* Graph preview illustration */}
          <div className="mt-20 relative">
            <div className="aspect-video max-w-4xl mx-auto rounded-2xl bg-graph-bg border border-border overflow-hidden shadow-2xl shadow-primary/10">
              <div className="w-full h-full relative">
                {/* Simulated graph visualization */}
                <svg className="w-full h-full" viewBox="0 0 800 450">
                  <defs>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="oklch(0.65 0.2 250)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="oklch(0.65 0.2 250)" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Edges */}
                  <g stroke="oklch(0.4 0.1 250)" strokeWidth="1" opacity="0.4">
                    <line x1="200" y1="150" x2="400" y2="225" />
                    <line x1="400" y1="225" x2="600" y2="150" />
                    <line x1="400" y1="225" x2="300" y2="350" />
                    <line x1="400" y1="225" x2="500" y2="350" />
                    <line x1="300" y1="350" x2="500" y2="350" />
                    <line x1="200" y1="150" x2="300" y2="350" />
                    <line x1="600" y1="150" x2="500" y2="350" />
                  </g>
                  
                  {/* Nodes */}
                  <g>
                    {/* Completed */}
                    <circle cx="200" cy="150" r="20" fill="url(#nodeGlow)" />
                    <circle cx="200" cy="150" r="12" fill="oklch(0.75 0.15 170)" />
                    
                    {/* In progress */}
                    <circle cx="400" cy="225" r="24" fill="url(#nodeGlow)" />
                    <circle cx="400" cy="225" r="14" fill="oklch(0.75 0.15 90)" />
                    
                    {/* Unlocked */}
                    <circle cx="600" cy="150" r="18" fill="url(#nodeGlow)" />
                    <circle cx="600" cy="150" r="10" fill="oklch(0.65 0.2 250)" />
                    
                    <circle cx="300" cy="350" r="16" fill="url(#nodeGlow)" />
                    <circle cx="300" cy="350" r="9" fill="oklch(0.65 0.2 250)" />
                    
                    <circle cx="500" cy="350" r="16" fill="url(#nodeGlow)" />
                    <circle cx="500" cy="350" r="9" fill="oklch(0.65 0.2 250)" />
                  </g>
                  
                  {/* Labels */}
                  <g fill="white" fontSize="11" fontFamily="Geist, sans-serif">
                    <text x="200" y="185" textAnchor="middle" opacity="0.8">{t('graph.fundamentals')}</text>
                    <text x="400" y="265" textAnchor="middle" opacity="0.8">{t('graph.coreConcepts')}</text>
                    <text x="600" y="185" textAnchor="middle" opacity="0.8">{t('graph.advanced')}</text>
                    <text x="300" y="385" textAnchor="middle" opacity="0.6">{t('graph.practice')}</text>
                    <text x="500" y="385" textAnchor="middle" opacity="0.6">{t('graph.projects')}</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="5" cy="6" r="2" />
                    <circle cx="19" cy="6" r="2" />
                    <line x1="9.5" y1="10" x2="6.5" y2="7.5" />
                    <line x1="14.5" y1="10" x2="17.5" y2="7.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('features.graphs.title')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('features.graphs.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('features.adaptive.title')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('features.adaptive.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('features.social.title')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('features.social.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For teachers section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <span className="text-xs font-medium text-accent">{t('teachers.badge')}</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t('teachers.title')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('teachers.description')}
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  {t('teachers.feature1')}
                </li>
                <li className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  {t('teachers.feature2')}
                </li>
                <li className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  {t('teachers.feature3')}
                </li>
              </ul>
              <Link href="/auth/sign-up?role=teacher" className="inline-block mt-8">
                <Button>
                  {t('teachers.cta')}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 p-8">
                <div className="w-full h-full rounded-xl bg-card/80 backdrop-blur border border-border flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('teachers.placeholder')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('cta.description')}
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('footer.builtWith')}
          </div>
        </div>
      </footer>
    </div>
  )
}
