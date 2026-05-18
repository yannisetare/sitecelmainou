import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArchitectClient } from './architect-client'

export default async function ArchitectPage() {
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

  // Only teachers can access architect mode
  if (profile?.role !== 'teacher') {
    redirect('/dashboard')
  }

  // Fetch user's graphs
  const { data: graphs } = await supabase
    .from('graphs')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <ArchitectClient 
      user={profile} 
      initialGraphs={graphs || []} 
    />
  )
}
