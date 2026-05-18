'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGraphStore } from '@/lib/store'
import type { Presence, Profile } from '@/lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UsePresenceOptions {
  graphId: string
  userId: string
  enabled?: boolean
}

export function usePresence({ graphId, userId, enabled = true }: UsePresenceOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const { setPresence, selectedNode } = useGraphStore()
  const lastNodeIdRef = useRef<string | null>(null)

  // Update presence when selected node changes
  const updatePresence = useCallback(async (nodeId: string | null) => {
    if (!enabled || !graphId || !userId) return
    
    const supabase = createClient()
    
    try {
      await supabase
        .from('presence')
        .upsert({
          user_id: userId,
          graph_id: graphId,
          node_id: nodeId,
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'user_id,graph_id',
        })
    } catch (error) {
      console.error('Error updating presence:', error)
    }
  }, [graphId, userId, enabled])

  // Fetch current presence for the graph
  const fetchPresence = useCallback(async () => {
    if (!enabled || !graphId) return
    
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('presence')
        .select('*, user:profiles(display_name, avatar_url)')
        .eq('graph_id', graphId)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      
      if (error) throw error
      
      // Transform to include user data
      const presenceWithUsers = (data || []).map((p: any) => ({
        ...p,
        user: p.user as Profile | undefined,
      })) as Presence[]
      
      setPresence(presenceWithUsers.filter(p => p.user_id !== userId))
    } catch (error) {
      console.error('Error fetching presence:', error)
    }
  }, [graphId, userId, enabled, setPresence])

  // Set up real-time subscription
  useEffect(() => {
    if (!enabled || !graphId) return

    const supabase = createClient()
    
    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${graphId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
          filter: `graph_id=eq.${graphId}`,
        },
        () => {
          // Refetch presence when any change happens
          fetchPresence()
        }
      )
      .subscribe()

    channelRef.current = channel

    // Initial fetch
    fetchPresence()

    // Update own presence
    updatePresence(selectedNode?.id || null)

    // Cleanup
    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [graphId, enabled, fetchPresence, updatePresence, selectedNode?.id])

  // Update presence when selected node changes
  useEffect(() => {
    const currentNodeId = selectedNode?.id || null
    if (currentNodeId !== lastNodeIdRef.current) {
      lastNodeIdRef.current = currentNodeId
      updatePresence(currentNodeId)
    }
  }, [selectedNode?.id, updatePresence])

  // Heartbeat to keep presence alive
  useEffect(() => {
    if (!enabled || !graphId || !userId) return

    const interval = setInterval(() => {
      updatePresence(lastNodeIdRef.current)
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [enabled, graphId, userId, updatePresence])

  // Remove presence on unmount
  useEffect(() => {
    return () => {
      if (!graphId || !userId) return
      
      const supabase = createClient()
      
      // Remove presence record
      supabase
        .from('presence')
        .delete()
        .eq('user_id', userId)
        .eq('graph_id', graphId)
        .then(() => {})
        .catch(console.error)
    }
  }, [graphId, userId])

  return {
    updatePresence,
    fetchPresence,
  }
}
