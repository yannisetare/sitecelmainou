'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !profileData) {
        // Create profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            role: user.user_metadata?.role || 'student',
          })
          .select()
          .single()
        
        if (newProfile) {
          setProfile(newProfile)
          setFormData({
            full_name: newProfile.full_name || '',
            bio: newProfile.bio || '',
          })
        }
      } else {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
        })
      }
      
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    setMessage(null)
    
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        bio: formData.bio,
      })
      .eq('id', profile.id)

    if (error) {
      setMessage({ type: 'error', text: t('profile.error') })
    } else {
      setProfile({ ...profile, ...formData })
      setMessage({ type: 'success', text: t('profile.saved') })
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{t('profile.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('profile.description')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile.full_name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-foreground">
                      {profile.full_name || 'User'}
                    </h2>
                    <Badge variant={profile.role === 'teacher' ? 'default' : 'secondary'} className="capitalize">
                      {profile.role === 'teacher' ? t('auth.teacher') : t('auth.student')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{profile.email}</p>
                  {profile.created_at && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('profile.memberSince')}: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder={t('profile.fullName')}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">{t('profile.role')}</Label>
                <Input
                  id="role"
                  value={profile.role === 'teacher' ? t('auth.teacher') : t('auth.student')}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t('profile.bioPlaceholder')}
                  rows={4}
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-accent/20 text-accent-foreground' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {message.text}
                </div>
              )}

              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('profile.saving') : t('profile.save')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
