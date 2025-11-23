/**
 * Session Thunks
 * Async actions for managing LiveKit sessions
 */

import type { AppDispatch } from '@/store'
import { startSession as apiStartSession } from '@/services/sessionService'
import { livekitService } from '@/services/livekitService'
import { transcriptService } from '@/services/transcriptService'
import {
  setLiveSessionData,
  setLiveSessionStatus,
  setLiveSessionError,
  clearLiveSession,
  addTranscript,
} from '@/store/slice/sessionslice'
import type { TranscriptMessage } from '@/types/session'

/**
 * Start a new LiveKit session
 * This will:
 * 1. Call the backend to create a session and get LiveKit credentials
 * 2. Request system audio from the user
 * 3. Connect to LiveKit room and publish audio
 * 4. Connect to transcript WebSocket
 */
export const startLiveSession = () => async (dispatch: AppDispatch) => {
  try {
    // Set status to connecting
    dispatch(setLiveSessionStatus('connecting'))

    // Step 1: Call backend to create session
    const response = await apiStartSession()

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to start session')
    }

    const { sessionId, roomName, livekitUrl, tokens } = response.data

    // Store session data in Redux
    dispatch(setLiveSessionData({
      sessionId,
      roomName,
      livekitUrl,
      token: tokens.lawyer,
    }))

    // Step 2: Connect to LiveKit and start audio streaming
    dispatch(setLiveSessionStatus('connecting'))

    try {
      await livekitService.startAudioStreaming({
        url: livekitUrl,
        token: tokens.lawyer,
        roomName,
      })

      // Set up LiveKit event listeners
      livekitService.onDisconnected(() => {
        dispatch(setLiveSessionStatus('disconnected'))
      })

      livekitService.onConnectionStateChanged((state) => {
        console.log('LiveKit connection state:', state)
      })

      dispatch(setLiveSessionStatus('streaming'))
    } catch (audioError: any) {
      throw new Error(`Failed to start audio streaming: ${audioError.message}`)
    }

    // Step 3: Connect to transcript WebSocket
    transcriptService.connect(roomName)

    // Set up transcript event listeners
    transcriptService.onTranscript((transcript: TranscriptMessage) => {
      dispatch(addTranscript(transcript))
    })

    transcriptService.onError((error) => {
      console.error('Transcript WebSocket error:', error)
    })

    transcriptService.onClose(() => {
      console.log('Transcript WebSocket closed')
    })

    console.log('Live session started successfully')
  } catch (error: any) {
    console.error('Failed to start live session:', error)
    dispatch(setLiveSessionError(error.message || 'Failed to start session'))

    // Clean up on error
    livekitService.disconnect()
    transcriptService.disconnect()
  }
}

/**
 * End the active LiveKit session
 * This will disconnect from LiveKit and WebSocket, and clear session data
 */
export const endLiveSession = () => async (dispatch: AppDispatch) => {
  try {
    // Disconnect from LiveKit
    livekitService.disconnect()

    // Disconnect from transcript WebSocket
    transcriptService.disconnect()

    // Clear session data from Redux
    dispatch(clearLiveSession())

    console.log('Live session ended successfully')
  } catch (error: any) {
    console.error('Failed to end live session:', error)
    dispatch(setLiveSessionError(error.message || 'Failed to end session'))
  }
}

/**
 * Get the current session status
 */
export const checkSessionStatus = () => async (dispatch: AppDispatch) => {
  const isLiveKitConnected = livekitService.isConnected()
  const isTranscriptConnected = transcriptService.isConnected()

  if (isLiveKitConnected && isTranscriptConnected) {
    dispatch(setLiveSessionStatus('streaming'))
  } else if (isLiveKitConnected) {
    dispatch(setLiveSessionStatus('connected'))
  } else {
    dispatch(setLiveSessionStatus('disconnected'))
  }
}
