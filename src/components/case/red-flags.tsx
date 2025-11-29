"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppSelector } from "@/store/hooks"
import type { RootState } from "@/store"
import { AlertTriangle, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface RedFlag {
  id: string
  caseId: string
  type: "inconsistency" | "concern" | "critical"
  title: string
  description: string
  source?: string
  timestamp: number
  isNew?: boolean
}

export function RedFlags() {
  const redFlags = useAppSelector((state: RootState) => state.redFlags?.flags || [])
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new red flag arrives
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [redFlags])

  const criticalCount = redFlags.filter(f => f.type === 'critical').length
  const concernCount = redFlags.filter(f => f.type === 'concern').length
  const inconsistencyCount = redFlags.filter(f => f.type === 'inconsistency').length

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold">Red Flags</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {redFlags.length} {redFlags.length === 1 ? 'flag' : 'flags'}
          </Badge>
        </div>

        {/* Summary Stats */}
        {redFlags.length > 0 && (
          <div className="flex gap-4 text-xs">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-medium">{criticalCount} Critical</span>
              </div>
            )}
            {concernCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-medium">{concernCount} Concern</span>
              </div>
            )}
            {inconsistencyCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="font-medium">{inconsistencyCount} Inconsistency</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Red Flags Content */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="p-6 space-y-4">
          {redFlags.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center space-y-3 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No red flags detected
                </p>
                <p className="text-xs text-muted-foreground/60">
                  The AI will automatically flag inconsistencies, concerns, or critical issues during the session
                </p>
              </div>
            </div>
          ) : (
            redFlags.map((flag) => (
              <RedFlagItem key={flag.id} flag={flag} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface RedFlagItemProps {
  flag: RedFlag
}

function RedFlagItem({ flag }: RedFlagItemProps) {
  const time = new Date(flag.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const typeConfig = {
    critical: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      label: 'Critical',
    },
    concern: {
      bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      label: 'Concern',
    },
    inconsistency: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      label: 'Inconsistency',
    },
  }

  const config = typeConfig[flag.type]

  return (
    <div className={cn(
      "relative rounded-lg border-2 p-4 transition-all hover:shadow-md",
      config.bg,
      flag.isNew && "animate-pulse"
    )}>
      {flag.isNew && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">NEW</Badge>
        </div>
      )}

      <div className="flex gap-3">
        <div className={cn("flex-shrink-0 p-2 rounded-md h-fit", config.iconBg)}>
          <AlertTriangle className={cn("h-4 w-4", config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{flag.title}</h3>
            <Badge variant="outline" className={cn("text-xs shrink-0 border", config.badge)}>
              {config.label}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {flag.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
            {flag.source && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground/60">•</span>
                <span>Source: {flag.source}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
