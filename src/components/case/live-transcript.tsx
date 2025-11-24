"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppSelector } from "@/store/hooks"
import type { RootState } from "@/store"
import { cn } from "@/lib/utils"

export function LiveTranscript() {
  const transcripts = useAppSelector((state: RootState) => state.AppSessions.transcripts)
  const liveSession = useAppSelector((state: RootState) => state.AppSessions.liveSession)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new transcript arrives
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [transcripts])

  const isActive = liveSession.status === 'streaming' || liveSession.status === 'connected'

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Live Transcript</h2>
          {isActive && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Recording</span>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Content */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="p-4 space-y-4">
          {transcripts.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isActive
                    ? 'Waiting for audio...'
                    : 'Start a session to see live transcripts'}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {isActive
                    ? 'Transcripts will appear here once audio is detected'
                    : 'Click "Start Session" to begin'}
                </p>
              </div>
            </div>
          ) : (
            transcripts.map((transcript, index) => (
              <TranscriptItem
                key={`${transcript.timestamp}-${index}`}
                speaker={transcript.speaker}
                text={transcript.text}
                timestamp={transcript.timestamp}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with transcript count */}
      {transcripts.length > 0 && (
        <div className="border-t border-border px-4 py-2 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {transcripts.length} {transcripts.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
      )}
    </div>
  )
}

interface TranscriptItemProps {
  speaker: string
  text: string
  timestamp: number
}

function TranscriptItem({ speaker, text, timestamp }: TranscriptItemProps) {
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            speaker === 'lawyer' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
          )}
        >
          {speaker || 'SPEAKER'}
        </span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  )
}
