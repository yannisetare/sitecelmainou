import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch available graphs (public + owned)
  const { data: graphs } = await supabase
    .from('graphs')
    .select('*, owner:profiles(display_name, avatar_url)')
    .or(`is_public.eq.true,owner_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient 
      user={profile || { id: user.id, display_name: user.email, avatar_url: null, role: 'student', created_at: new Date().toISOString() }} 
      initialGraphs={graphs || []} 
    />
  )
}
