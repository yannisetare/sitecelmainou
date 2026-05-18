'use client'

import { useState, useCallback } from 'react'
import { useGraphStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Upload, X, FileText, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { UploadedFile } from '@/lib/types'

interface FileUploadSectionProps {
  onClose: () => void
}

export function FileUploadSection({ onClose }: FileUploadSectionProps) {
  const { uploadedFiles, addUploadedFile, updateUploadedFile, removeUploadedFile, isUploading, setIsUploading } = useGraphStore()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const simulateUpload = useCallback((file: File) => {
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
        
        // Simulate processing
        setTimeout(() => {
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
    
    validFiles.forEach(simulateUpload)
  }, [simulateUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(simulateUpload)
    e.target.value = '' // Reset input
  }, [simulateUpload])

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />
    }
    return <File className="w-5 h-5 text-blue-400" />
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-primary" />
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

  return (
    <div className="border-b border-border bg-card/50 p-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">Upload Content</h3>
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
          Drag and drop files here
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse (PDF, TXT, DOC)
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
                        {file.status === 'processing' ? 'Processing...' : `${Math.round(file.progress)}%`}
                      </span>
                      <Progress value={file.progress} className="flex-1 h-1" />
                    </>
                  )}
                  {file.status === 'completed' && (
                    <span className="text-xs text-primary">Ready to generate graph</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Button */}
      {uploadedFiles.some(f => f.status === 'completed') && (
        <Button className="w-full mt-4" disabled={isUploading}>
          Generate Knowledge Graph
        </Button>
      )}
    </div>
  )
}
