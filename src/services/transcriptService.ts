/**
 * Transcript Service
 * Handles WebSocket connection for receiving live transcripts
 */

import { API_ENDPOINTS } from '@/action/endpoint'
import type { TranscriptMessage } from '@/types/session'

export class TranscriptService {
  private ws: WebSocket | null = null
  private onTranscriptCallback?: (transcript: TranscriptMessage) => void
  private onErrorCallback?: (error: Event) => void
  private onCloseCallback?: () => void
  private roomNameFilter?: string

  /**
   * Connect to the transcript WebSocket
   */
  connect(roomName?: string): void {
    if (this.ws) {
      console.warn('WebSocket already connected')
      return
    }

    this.roomNameFilter = roomName

    try {
      this.ws = new WebSocket(API_ENDPOINTS.WS_TRANSCRIPT)

      this.ws.onopen = () => {
        console.log('Transcript WebSocket connected')
      }

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data.toString()) as TranscriptMessage

          if (data.type === 'transcript') {
            // Filter by room name if specified
            if (this.roomNameFilter && data.roomName !== this.roomNameFilter) {
              return
            }

            // Call the transcript callback
            this.onTranscriptCallback?.(data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error: Event) => {
        console.error('Transcript WebSocket error:', error)
        this.onErrorCallback?.(error)
      }

      this.ws.onclose = () => {
        console.log('Transcript WebSocket closed')
        this.ws = null
        this.onCloseCallback?.()
      }
    } catch (error) {
      console.error('Failed to connect to transcript WebSocket:', error)
      throw error
    }
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      console.log('Transcript WebSocket disconnected')
    }
  }

  /**
   * Register callback for new transcript messages
   */
  onTranscript(callback: (transcript: TranscriptMessage) => void): void {
    this.onTranscriptCallback = callback
  }

  /**
   * Register callback for WebSocket errors
   */
  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * Register callback for WebSocket close
   */
  onClose(callback: () => void): void {
    this.onCloseCallback = callback
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Send a message through the WebSocket (if needed in future)
   */
  send(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected, cannot send message')
    }
  }
}

// Export a singleton instance
export const transcriptService = new TranscriptService()
