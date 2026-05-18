'use client'

import { useState, useCallback } from 'react'
import { useGraphStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Upload, X, FileText, File, CheckCircle2, AlertCircle, Loader2, Sparkles, Network } from 'lucide-react'
import type { UploadedFile } from '@/lib/types'

interface FileUploadSectionProps {
  onClose: () => void
}

export function FileUploadSection({ onClose }: FileUploadSectionProps) {
  const { uploadedFiles, addUploadedFile, updateUploadedFile, removeUploadedFile, isUploading, setIsUploading } = useGraphStore()
  const [isDragging, setIsDragging] = useState(false)
  const [graphTitle, setGraphTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [extractedContent, setExtractedContent] = useState('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const simulateUploadAndExtract = useCallback((file: File) => {
    const uploadFile: UploadedFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
      progress: 0,
    }
    
    addUploadedFile(uploadFile)
    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        updateUploadedFile(uploadFile.id, { progress: 100, status: 'processing' })
        
        // Simulate content extraction
        setTimeout(() => {
          // Mock extracted content based on filename
          const mockContent = file.name.toLowerCase().includes('math') 
            ? 'Algebra, ecuații liniare, funcții, calcul diferențial'
            : file.name.toLowerCase().includes('history') || file.name.toLowerCase().includes('istori')
            ? 'Civilizații antice, Imperiul Roman, Evul Mediu, Renaștere'
            : `Conținut extras din: ${file.name}. Concepte principale și subiecte de studiu.`
          
          setExtractedContent(prev => prev ? `${prev}\n${mockContent}` : mockContent)
          setGraphTitle(file.name.replace(/\.[^/.]+$/, ''))
          updateUploadedFile(uploadFile.id, { status: 'completed' })
          setIsUploading(false)
        }, 1500)
      } else {
        updateUploadedFile(uploadFile.id, { progress })
      }
    }, 200)
  }, [addUploadedFile, updateUploadedFile, setIsUploading])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(f => 
      f.type === 'application/pdf' || 
      f.type === 'text/plain' ||
      f.type.includes('document')
    )
    
    validFiles.forEach(simulateUploadAndExtract)
  }, [simulateUploadAndExtract])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(simulateUploadAndExtract)
    e.target.value = '' // Reset input
  }, [simulateUploadAndExtract])

  const handleGenerateGraph = async () => {
    if (!extractedContent || !graphTitle.trim()) return
    
    setIsGenerating(true)
    setGenerationStatus('loading')
    
    try {
      const response = await fetch('/api/generate-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: extractedContent,
          title: graphTitle.trim(),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate graph')
      }
      
      const result = await response.json()
      setGenerationStatus('success')
      
      // Reload page to show new graph
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      console.error('Error generating graph:', error)
      setGenerationStatus('error')
    } finally {
      setIsGenerating(false)
    }
  }

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />
    }
    return <File className="w-5 h-5 text-blue-400" />
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-accent" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const hasCompletedFiles = uploadedFiles.some(f => f.status === 'completed')

  return (
    <div className="border-b border-border bg-card/50 p-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">Încarcă Material</h3>
          <span className="text-xs text-muted-foreground">PDF, TXT, DOC</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center transition-colors",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.doc,.docx"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={cn(
          "w-10 h-10 mx-auto mb-3 transition-colors",
          isDragging ? "text-primary" : "text-muted-foreground"
        )} />
        <p className="text-sm text-foreground font-medium mb-1">
          Trage și plasează fișierele aici
        </p>
        <p className="text-xs text-muted-foreground">
          sau click pentru a selecta (PDF, TXT, DOC)
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map(file => (
            <div 
              key={file.id} 
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeUploadedFile(file.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {file.status === 'processing' ? 'Se procesează...' : `${Math.round(file.progress)}%`}
                      </span>
                      <Progress value={file.progress} className="flex-1 h-1" />
                    </>
                  )}
                  {file.status === 'completed' && (
                    <span className="text-xs text-accent">Gata pentru generare</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Graph Title Input & Generate Button */}
      {hasCompletedFiles && (
        <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Generare Graf cu AI</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="graph-title" className="text-xs text-muted-foreground">
                Titlu Graf
              </Label>
              <Input
                id="graph-title"
                value={graphTitle}
                onChange={(e) => setGraphTitle(e.target.value)}
                placeholder="Ex: Algebră - Introducere"
                className="mt-1"
              />
            </div>
            
            <Button 
              className="w-full gap-2" 
              onClick={handleGenerateGraph}
              disabled={isGenerating || !graphTitle.trim() || generationStatus === 'success'}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se generează graful...
                </>
              ) : generationStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Graf generat cu succes!
                </>
              ) : (
                <>
                  <Network className="w-4 h-4" />
                  Generează Graf cu Gemini AI
                </>
              )}
            </Button>
            
            {generationStatus === 'error' && (
              <p className="text-xs text-destructive text-center">
                Eroare la generare. Te rugăm să încerci din nou.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
