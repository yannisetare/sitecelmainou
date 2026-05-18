import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { node_id, status, score } = body

    if (!node_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['locked', 'unlocked', 'in_progress', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Upsert progress
    const progressData: {
      user_id: string
      node_id: string
      status: string
      score?: number
      started_at?: string
      completed_at?: string
    } = {
      user_id: user.id,
      node_id,
      status,
    }

    if (status === 'in_progress') {
      progressData.started_at = new Date().toISOString()
    }

    if (status === 'completed') {
      progressData.completed_at = new Date().toISOString()
      if (score !== undefined) {
        progressData.score = score
      }
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(progressData, {
        onConflict: 'user_id,node_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating progress:', error)
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    // If completed, check if any dependent nodes should be unlocked
    if (status === 'completed') {
      // Get the graph_id for this node
      const { data: nodeData } = await supabase
        .from('nodes')
        .select('graph_id')
        .eq('id', node_id)
        .single()

      if (nodeData) {
        // Get all edges where this node is the source
        const { data: outgoingEdges } = await supabase
          .from('edges')
          .select('target_id')
          .eq('source_id', node_id)
          .eq('graph_id', nodeData.graph_id)

        if (outgoingEdges && outgoingEdges.length > 0) {
          for (const edge of outgoingEdges) {
            // Check if all prerequisites for the target are completed
            const { data: prereqEdges } = await supabase
              .from('edges')
              .select('source_id')
              .eq('target_id', edge.target_id)
              .eq('graph_id', nodeData.graph_id)

            const { data: prereqProgress } = await supabase
              .from('user_progress')
              .select('status')
              .eq('user_id', user.id)
              .in('node_id', (prereqEdges || []).map(e => e.source_id))

            const allCompleted = prereqProgress?.every(p => p.status === 'completed')

            if (allCompleted) {
              // Check if already has progress
              const { data: existingProgress } = await supabase
                .from('user_progress')
                .select('status')
                .eq('user_id', user.id)
                .eq('node_id', edge.target_id)
                .single()

              // Only unlock if currently locked or no progress
              if (!existingProgress || existingProgress.status === 'locked') {
                await supabase
                  .from('user_progress')
                  .upsert({
                    user_id: user.id,
                    node_id: edge.target_id,
                    status: 'unlocked',
                  }, {
                    onConflict: 'user_id,node_id',
                  })
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const graph_id = searchParams.get('graph_id')

    if (!graph_id) {
      return NextResponse.json({ error: 'Missing graph_id' }, { status: 400 })
    }

    // Get all nodes for this graph
    const { data: nodes } = await supabase
      .from('nodes')
      .select('id')
      .eq('graph_id', graph_id)

    if (!nodes) {
      return NextResponse.json({ error: 'Graph not found' }, { status: 404 })
    }

    // Get user progress for these nodes
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('node_id', nodes.map(n => n.id))

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    return NextResponse.json({ progress: progress || [] })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
