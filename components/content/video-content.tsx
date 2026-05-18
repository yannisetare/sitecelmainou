'use client'

import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Loading video player...</div>
    </div>
  )
})

interface VideoContentProps {
  url: string
}

export function VideoContent({ url }: VideoContentProps) {
  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Video content from external source
      </p>
    </div>
  )
}
