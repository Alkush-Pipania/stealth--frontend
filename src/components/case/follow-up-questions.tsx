"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppSelector } from "@/store/hooks"
import type { RootState } from "@/store"
import { MessageSquarePlus, Lightbulb, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface FollowUpQuestion {
  id: string
  questionId: string
  text: string
  context?: string
  priority: number
  status: "pending" | "addressed" | "dismissed"
  timestamp: number
  isNew?: boolean
}

export function FollowUpQuestions() {
  const followUps = useAppSelector((state: RootState) => state.followUps?.questions || [])
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new follow-up arrives
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [followUps])

  const pendingCount = followUps.filter(f => f.status === 'pending').length
  const addressedCount = followUps.filter(f => f.status === 'addressed').length

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <MessageSquarePlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Follow-up Questions</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {followUps.length} {followUps.length === 1 ? 'question' : 'questions'}
          </Badge>
        </div>

        {/* Summary Stats */}
        {followUps.length > 0 && (
          <div className="flex gap-4 text-xs">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-medium">{pendingCount} Pending</span>
              </div>
            )}
            {addressedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3" />
                <span className="font-medium">{addressedCount} Addressed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follow-up Questions Content */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="p-6 space-y-4">
          {followUps.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center space-y-3 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No follow-up questions yet
                </p>
                <p className="text-xs text-muted-foreground/60">
                  AI-generated follow-up questions will appear here based on the conversation and responses
                </p>
              </div>
            </div>
          ) : (
            followUps.map((followUp) => (
              <FollowUpItem key={followUp.id} followUp={followUp} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface FollowUpItemProps {
  followUp: FollowUpQuestion
}

function FollowUpItem({ followUp }: FollowUpItemProps) {
  const time = new Date(followUp.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusConfig = {
    pending: {
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      label: 'Pending',
    },
    addressed: {
      bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      label: 'Addressed',
    },
    dismissed: {
      bg: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
      badge: 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
      label: 'Dismissed',
    },
  }

  const config = statusConfig[followUp.status]

  return (
    <div className={cn(
      "relative rounded-lg border-2 p-4 transition-all hover:shadow-md",
      config.bg,
      followUp.isNew && "ring-2 ring-blue-400 ring-offset-2"
    )}>
      {followUp.isNew && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5 animate-pulse">NEW</Badge>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              P{followUp.priority}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-relaxed">{followUp.text}</p>
            <Badge variant="outline" className={cn("text-xs shrink-0 border", config.badge)}>
              {config.label}
            </Badge>
          </div>

          {followUp.context && (
            <div className="bg-muted/50 rounded-md p-3 border border-border/50">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Context: {followUp.context}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>

            {followUp.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    // TODO: Implement mark as addressed
                    console.log('Mark as addressed:', followUp.id)
                  }}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Mark Addressed
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    // TODO: Implement dismiss
                    console.log('Dismiss:', followUp.id)
                  }}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
