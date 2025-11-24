/**
 * Session Types
 * Types for LiveKit session management and transcription
 */

export interface StartSessionResponse {
  sessionId: string
  roomName: string
  livekitUrl: string
  tokens: {
    lawyer: string
    backend: string
  }
}

export interface TranscriptMessage {
  type: 'transcript'
  text: string
  speaker: string
  roomName: string
  timestamp: number
}

export interface SessionStatus {
  isConnected: boolean
  isStreaming: boolean
  error: string | null
}

export interface LiveKitConnectionConfig {
  url: string
  token: string
  roomName: string
}

export type SessionState = 'idle' | 'connecting' | 'connected' | 'streaming' | 'disconnected' | 'error'
