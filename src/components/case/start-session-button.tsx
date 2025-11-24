"use client"

import * as React from "react"
import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { startLiveSession, endLiveSession } from "@/store/thunk/sessionthunk"
import { toast } from "sonner"
import type { RootState } from "@/store"

export function StartSessionButton() {
  const dispatch = useAppDispatch()
  const liveSession = useAppSelector((state: RootState) => state.AppSessions.liveSession)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleStartSession = async () => {
    setIsLoading(true)

    try {
      await dispatch(startLiveSession())

      if (liveSession.status === 'streaming') {
        toast.success('Session started successfully')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async () => {
    setIsLoading(true)

    try {
      await dispatch(endLiveSession())
      toast.success('Session ended')
    } catch (error: any) {
      toast.error(error.message || 'Failed to end session')
    } finally {
      setIsLoading(false)
    }
  }

  const isActive = liveSession.status === 'streaming' || liveSession.status === 'connected'
  const isConnecting = liveSession.status === 'connecting'

  return (
    <div className="space-y-2">
      {!isActive ? (
        <Button
          onClick={handleStartSession}
          disabled={isLoading || isConnecting}
          className="w-full"
          variant="default"
        >
          <Play className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Start Session'}
        </Button>
      ) : (
        <Button
          onClick={handleEndSession}
          disabled={isLoading}
          className="w-full"
          variant="destructive"
        >
          <Square className="h-4 w-4 mr-2" />
          Stop Session
        </Button>
      )}

      {liveSession.status !== 'idle' && (
        <div className="text-xs text-center text-muted-foreground">
          Status: {liveSession.status}
        </div>
      )}

      {liveSession.error && (
        <div className="text-xs text-center text-destructive">
          {liveSession.error}
        </div>
      )}
    </div>
  )
}
