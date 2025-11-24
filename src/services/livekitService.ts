/**
 * LiveKit Service
 * Handles LiveKit room connection and audio streaming
 */

import { Room, LocalAudioTrack, RoomEvent, ConnectionState } from 'livekit-client'
import type { LiveKitConnectionConfig } from '@/types/session'

export class LiveKitService {
  private room: Room | null = null
  private audioTrack: LocalAudioTrack | null = null
  private onDisconnectedCallback?: () => void
  private onConnectionStateChangedCallback?: (state: string) => void

  /**
   * Connect to LiveKit room with provided configuration
   */
  async connect(config: LiveKitConnectionConfig): Promise<void> {
    try {
      if (this.room) {
        console.warn('Already connected to a room')
        return
      }

      // Create a new Room instance
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      this.room = room

      // Set up event listeners before connecting
      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit room')
        this.onDisconnectedCallback?.()
      })

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('LiveKit connection state:', state)
        this.onConnectionStateChangedCallback?.(state)
      })

      // Connect to the room
      await room.connect(config.url, config.token, {
        autoSubscribe: false, // We don't need to subscribe to other participants
      })

      console.log('Successfully connected to LiveKit room:', config.roomName)
    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error)
      throw error
    }
  }

  /**
   * Request system audio (screen/tab share with audio) from the user
   * User should select the Zoom/Meet tab or window
   */
  async requestSystemAudio(): Promise<MediaStream> {
    try {
      // Request display media with audio
      // This will prompt the user to select a screen/window/tab to share
      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({
        audio: true, // Request audio from the shared screen/tab
        video: true, // Some browsers require video, we'll just use audio
      })

      // Check if audio track exists
      const audioTracks = displayStream.getAudioTracks()
      if (audioTracks.length === 0) {
        throw new Error('No audio track found in shared media. Please ensure you select "Share tab audio" or "Share system sound" when sharing.')
      }

      console.log('System audio captured successfully')
      return displayStream
    } catch (error) {
      console.error('Failed to capture system audio:', error)
      throw error
    }
  }

  /**
   * Publish system audio track to the LiveKit room
   */
  async publishAudioTrack(mediaStream: MediaStream): Promise<void> {
    try {
      if (!this.room) {
        throw new Error('Not connected to LiveKit room')
      }

      const audioTrack = mediaStream.getAudioTracks()[0]
      if (!audioTrack) {
        throw new Error('No audio track found in media stream')
      }

      // Create LocalAudioTrack from the system audio
      const localAudioTrack = new LocalAudioTrack(audioTrack)
      this.audioTrack = localAudioTrack

      // Publish the track to the room
      await this.room.localParticipant.publishTrack(localAudioTrack, {
        name: 'system-audio',
      })

      console.log('Audio track published to LiveKit room')
    } catch (error) {
      console.error('Failed to publish audio track:', error)
      throw error
    }
  }

  private audioContext: AudioContext | null = null
  private mixedStreamDestination: MediaStreamAudioDestinationNode | null = null

  /**
   * Request microphone access
   */
  async captureMicrophone(): Promise<MediaStream> {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      console.log('Microphone audio captured successfully')
      return micStream
    } catch (error) {
      console.error('Failed to capture microphone:', error)
      throw new Error('Failed to access microphone. Please grant microphone permissions.')
    }
  }

  /**
   * Mix system audio and microphone audio into a single stream
   */
  mixAudioStreams(systemStream: MediaStream, micStream: MediaStream): MediaStream {
    try {
      // Create AudioContext if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Create destination for mixed audio
      this.mixedStreamDestination = this.audioContext.createMediaStreamDestination()

      // Create sources
      if (systemStream.getAudioTracks().length > 0) {
        const systemSource = this.audioContext.createMediaStreamSource(systemStream)
        systemSource.connect(this.mixedStreamDestination)
      }

      if (micStream.getAudioTracks().length > 0) {
        const micSource = this.audioContext.createMediaStreamSource(micStream)
        micSource.connect(this.mixedStreamDestination)
      }

      console.log('Audio streams mixed successfully')
      return this.mixedStreamDestination.stream
    } catch (error) {
      console.error('Failed to mix audio streams:', error)
      throw error
    }
  }

  /**
   * Start complete audio streaming flow:
   * 1. Connect to room
   * 2. Request system audio
   * 3. Request microphone audio
   * 4. Mix streams
   * 5. Publish mixed track
   */
  async startAudioStreaming(config: LiveKitConnectionConfig): Promise<void> {
    await this.connect(config)

    // Capture both streams
    const systemStream = await this.requestSystemAudio()
    const micStream = await this.captureMicrophone()

    // Mix them
    const mixedStream = this.mixAudioStreams(systemStream, micStream)

    // Publish the mixed stream
    await this.publishAudioTrack(mixedStream)
  }

  /**
   * Disconnect from the room and clean up resources
   */
  disconnect(): void {
    if (this.room) {
      this.room.disconnect()
      this.room = null
    }
    if (this.audioTrack) {
      this.audioTrack.stop()
      this.audioTrack = null
    }

    // Close AudioContext
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.mixedStreamDestination = null

    console.log('Disconnected from LiveKit room and cleaned up resources')
  }

  /**
   * Register callback for disconnection events
   */
  onDisconnected(callback: () => void): void {
    this.onDisconnectedCallback = callback
  }

  /**
   * Register callback for connection state changes
   */
  onConnectionStateChanged(callback: (state: string) => void): void {
    this.onConnectionStateChangedCallback = callback
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.room !== null
  }

  /**
   * Get the current room instance
   */
  getRoom(): Room | null {
    return this.room
  }
}

// Export a singleton instance
export const livekitService = new LiveKitService()
