/**
 * Session Service
 * Handles API calls for LiveKit session management
 */

import { apiPost } from '@/action/server'
import { API_ENDPOINTS } from '@/action/endpoint'
import type { StartSessionResponse } from '@/types/session'

/**
 * Start a new LiveKit session
 * Calls the backend to create a LiveKit room and get connection tokens
 */
export async function startSession() {
  return apiPost<StartSessionResponse>(API_ENDPOINTS.START_SESSION, {
    includeAuth: true,
  })
}

/**
 * End an active session
 */
export async function endSession(sessionId: string) {
  return apiPost(API_ENDPOINTS.END_SESSION(sessionId), {
    includeAuth: true,
  })
}
