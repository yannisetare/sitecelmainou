'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateSparkleProps {
  className?: string
}

export function EmptyStateSparkle({ className }: EmptyStateSparkleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Mesh grid configuration
    const nodeCount = 25
    const connectionDistance = 150
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number }[] = []

    // Initialize nodes
    const rect = canvas.getBoundingClientRect()
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      })
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > rect.width) node.vx *= -1
        if (node.y < 0 || node.y > rect.height) node.vy *= -1

        // Keep in bounds
        node.x = Math.max(0, Math.min(rect.width, node.x))
        node.y = Math.max(0, Math.min(rect.height, node.y))

        // Draw connections
        nodes.slice(i + 1).forEach(otherNode => {
          const dx = otherNode.x - node.x
          const dy = otherNode.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(101, 130, 255, ${opacity})`
            ctx.lineWidth = 1
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.stroke()
          }
        })

        // Draw node
        ctx.beginPath()
        ctx.fillStyle = 'rgba(101, 130, 255, 0.3)'
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {/* Animated mesh background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Content overlay */}
      <div className="relative z-10 text-center max-w-lg px-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/10">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="3" />
            <circle cx="16" cy="16" r="3" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <path d="M10.5 9.5l3 4" />
            <path d="M8 11v5" />
            <path d="M13.5 6.5l-3 0" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-3 text-balance">
          Selectează un graf din stânga, intră într-o clasă sau încarcă un material pentru a porni motorul AI
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          Grafurile de cunoștințe te ajută să înveți mai eficient prin vizualizarea conexiunilor dintre concepte.
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <span>Noduri de concept</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-px bg-primary/30" />
            <span>Conexiuni logice</span>
          </div>
        </div>
      </div>
    </div>
  )
}
