import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock Gemini API response structure for knowledge graph generation
interface GeminiGraphResponse {
  nodes: {
    id: string
    label: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimated_minutes: number
    content: {
      markdown?: string
      quiz?: {
        questions: {
          id: string
          type: 'multiple_choice' | 'true_false'
          question: string
          options?: string[]
          correct_answer: string | number
          explanation?: string
        }[]
      }
    }
  }[]
  edges: {
    source: string
    target: string
    label?: string
  }[]
}

// Mock Gemini API call - simulates the free Google Gemini API
async function mockGeminiAPI(content: string): Promise<GeminiGraphResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Generate a mock knowledge graph based on content keywords
  const lowerContent = content.toLowerCase()
  
  // Detect subject and generate appropriate nodes
  let nodes: GeminiGraphResponse['nodes'] = []
  let edges: GeminiGraphResponse['edges'] = []
  
  if (lowerContent.includes('math') || lowerContent.includes('calcul') || lowerContent.includes('algebr')) {
    nodes = [
      {
        id: 'node-1',
        label: 'Introducere în Algebră',
        description: 'Conceptele fundamentale ale algebrei și operații de bază',
        difficulty: 'beginner',
        estimated_minutes: 15,
        content: {
          markdown: '# Introducere în Algebră\n\nAlgebra este ramura matematicii care se ocupă cu simboluri și regulile pentru manipularea acestor simboluri.\n\n## Concepte cheie:\n- Variabile și constante\n- Expresii algebrice\n- Ecuații simple',
          quiz: {
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                question: 'Ce este o variabilă în algebră?',
                options: ['Un număr fix', 'Un simbol care reprezintă o valoare necunoscută', 'O operație matematică', 'O ecuație'],
                correct_answer: 1,
                explanation: 'O variabilă este un simbol (de obicei o literă) care reprezintă o valoare necunoscută sau care poate varia.'
              }
            ]
          }
        }
      },
      {
        id: 'node-2',
        label: 'Ecuații Liniare',
        description: 'Rezolvarea ecuațiilor de gradul întâi',
        difficulty: 'beginner',
        estimated_minutes: 20,
        content: {
          markdown: '# Ecuații Liniare\n\nO ecuație liniară este o ecuație de gradul întâi cu o singură variabilă.\n\n## Formă generală:\nax + b = 0, unde a ≠ 0\n\n## Pași pentru rezolvare:\n1. Izolează termenii cu x pe o parte\n2. Izolează constantele pe cealaltă parte\n3. Împarte ambele părți la coeficientul lui x',
          quiz: {
            questions: [
              {
                id: 'q2',
                type: 'multiple_choice',
                question: 'Rezolvă: 2x + 4 = 10',
                options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
                correct_answer: 1,
                explanation: '2x + 4 = 10 → 2x = 6 → x = 3'
              }
            ]
          }
        }
      },
      {
        id: 'node-3',
        label: 'Sisteme de Ecuații',
        description: 'Rezolvarea sistemelor de ecuații liniare',
        difficulty: 'intermediate',
        estimated_minutes: 30,
        content: {
          markdown: '# Sisteme de Ecuații\n\nUn sistem de ecuații conține două sau mai multe ecuații cu aceleași variabile.\n\n## Metode de rezolvare:\n- Substituție\n- Eliminare\n- Metoda grafică',
        }
      },
      {
        id: 'node-4',
        label: 'Funcții Liniare',
        description: 'Înțelegerea și reprezentarea funcțiilor liniare',
        difficulty: 'intermediate',
        estimated_minutes: 25,
        content: {
          markdown: '# Funcții Liniare\n\nO funcție liniară este o funcție de forma f(x) = mx + n.\n\n## Caracteristici:\n- Graficul este o dreaptă\n- m = panta dreptei\n- n = ordonata la origine',
        }
      },
      {
        id: 'node-5',
        label: 'Ecuații Pătratice',
        description: 'Rezolvarea ecuațiilor de gradul al doilea',
        difficulty: 'advanced',
        estimated_minutes: 35,
        content: {
          markdown: '# Ecuații Pătratice\n\nO ecuație pătratică are forma ax² + bx + c = 0.\n\n## Formula rezolvării:\nx = (-b ± √(b²-4ac)) / 2a',
        }
      }
    ]
    edges = [
      { source: 'node-1', target: 'node-2', label: 'prerequisite' },
      { source: 'node-2', target: 'node-3', label: 'prerequisite' },
      { source: 'node-2', target: 'node-4', label: 'prerequisite' },
      { source: 'node-3', target: 'node-5', label: 'prerequisite' },
      { source: 'node-4', target: 'node-5', label: 'prerequisite' },
    ]
  } else if (lowerContent.includes('istori') || lowerContent.includes('history')) {
    nodes = [
      {
        id: 'node-1',
        label: 'Civilizații Antice',
        description: 'Primele civilizații din istoria omenirii',
        difficulty: 'beginner',
        estimated_minutes: 20,
        content: {
          markdown: '# Civilizații Antice\n\nCivilizațiile antice au pus bazele societății moderne.',
        }
      },
      {
        id: 'node-2',
        label: 'Imperiul Roman',
        description: 'Ascensiunea și căderea Romei',
        difficulty: 'intermediate',
        estimated_minutes: 30,
        content: {
          markdown: '# Imperiul Roman\n\nRoma a fost una dintre cele mai influente civilizații din istorie.',
        }
      },
      {
        id: 'node-3',
        label: 'Evul Mediu',
        description: 'Perioada medievală în Europa',
        difficulty: 'intermediate',
        estimated_minutes: 25,
        content: {
          markdown: '# Evul Mediu\n\nPerioada dintre căderea Imperiului Roman și Renaștere.',
        }
      }
    ]
    edges = [
      { source: 'node-1', target: 'node-2' },
      { source: 'node-2', target: 'node-3' },
    ]
  } else {
    // Default generic knowledge graph
    nodes = [
      {
        id: 'node-1',
        label: 'Introducere',
        description: 'Conceptele de bază ale subiectului',
        difficulty: 'beginner',
        estimated_minutes: 15,
        content: {
          markdown: '# Introducere\n\nAcesta este punctul de pornire pentru învățarea subiectului.',
          quiz: {
            questions: [
              {
                id: 'q1',
                type: 'true_false',
                question: 'Acest modul este despre conceptele de bază.',
                correct_answer: 'True',
                explanation: 'Da, acest modul acoperă conceptele fundamentale.'
              }
            ]
          }
        }
      },
      {
        id: 'node-2',
        label: 'Concepte Fundamentale',
        description: 'Aprofundarea conceptelor de bază',
        difficulty: 'beginner',
        estimated_minutes: 20,
        content: {
          markdown: '# Concepte Fundamentale\n\nÎn acest capitol vom explora mai în detaliu conceptele de bază.',
        }
      },
      {
        id: 'node-3',
        label: 'Aplicații Practice',
        description: 'Utilizarea cunoștințelor în practică',
        difficulty: 'intermediate',
        estimated_minutes: 30,
        content: {
          markdown: '# Aplicații Practice\n\nÎn acest capitol vom aplica cunoștințele dobândite.',
        }
      }
    ]
    edges = [
      { source: 'node-1', target: 'node-2' },
      { source: 'node-2', target: 'node-3' },
    ]
  }
  
  return { nodes, edges }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { content, title, graphId } = body
    
    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' }, 
        { status: 400 }
      )
    }
    
    // Call mock Gemini API
    const geminiResponse = await mockGeminiAPI(content)
    
    // If graphId provided, update existing graph; otherwise create new
    let graph
    if (graphId) {
      const { data, error } = await supabase
        .from('graphs')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', graphId)
        .eq('owner_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      graph = data
      
      // Delete existing nodes and edges
      await supabase.from('edges').delete().eq('graph_id', graphId)
      await supabase.from('nodes').delete().eq('graph_id', graphId)
    } else {
      const { data, error } = await supabase
        .from('graphs')
        .insert({
          title,
          description: `Graf generat de AI din: ${title}`,
          owner_id: user.id,
          is_public: false,
        })
        .select()
        .single()
      
      if (error) throw error
      graph = data
    }
    
    // Create nodes
    const nodeIdMap = new Map<string, string>()
    for (let i = 0; i < geminiResponse.nodes.length; i++) {
      const node = geminiResponse.nodes[i]
      const { data: createdNode, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          graph_id: graph.id,
          label: node.label,
          description: node.description,
          node_type: node.difficulty,
          content_type: node.content.quiz ? 'quiz' : 'markdown',
          content: node.content,
          position_x: (i % 3) * 200 - 200,
          position_y: Math.floor(i / 3) * 150 - 100,
          position_z: 0,
          size: node.difficulty === 'beginner' ? 1 : node.difficulty === 'intermediate' ? 2 : 3,
          estimated_minutes: node.estimated_minutes,
        })
        .select()
        .single()
      
      if (nodeError) throw nodeError
      nodeIdMap.set(node.id, createdNode.id)
    }
    
    // Create edges
    for (const edge of geminiResponse.edges) {
      const sourceId = nodeIdMap.get(edge.source)
      const targetId = nodeIdMap.get(edge.target)
      
      if (sourceId && targetId) {
        const { error: edgeError } = await supabase
          .from('edges')
          .insert({
            graph_id: graph.id,
            source_id: sourceId,
            target_id: targetId,
            label: edge.label || null,
            weight: 1.0,
          })
        
        if (edgeError) throw edgeError
      }
    }
    
    // Initialize user progress (first node unlocked)
    const firstNodeId = nodeIdMap.get('node-1')
    if (firstNodeId) {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          node_id: firstNodeId,
          status: 'unlocked',
          score: null,
          time_spent: 0,
        })
    }
    
    return NextResponse.json({
      success: true,
      graph,
      nodesCount: geminiResponse.nodes.length,
      edgesCount: geminiResponse.edges.length,
    })
    
  } catch (error) {
    console.error('Error generating graph:', error)
    return NextResponse.json(
      { error: 'Failed to generate knowledge graph' },
      { status: 500 }
    )
  }
}
