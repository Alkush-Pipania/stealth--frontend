import { BACKEND_URL, LIVE_BACKEND_URL } from '@/config/env';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${BACKEND_URL}/api/auth/login`,
  SIGNUP: `${BACKEND_URL}/api/auth/signup`,
  LOGOUT: `${BACKEND_URL}/api/auth/logout`,

  // Cases endpoints
  GET_CASES: `${BACKEND_URL}/api/cases`,
  CREATE_CASE: `${BACKEND_URL}/api/cases`,
  GET_CASE_BY_ID: (id: string) => `${BACKEND_URL}/api/cases/${id}`,
  UPDATE_CASE: (id: string) => `${BACKEND_URL}/api/cases/${id}`,
  DELETE_CASE: (id: string) => `${BACKEND_URL}/api/cases/${id}`,

  // Document endpoints
  GET_CASE_DOCUMENTS: (caseId: string) => `${BACKEND_URL}/api/${caseId}/documents`,
  PRESIGN_UPLOAD: (caseId: string) => `${BACKEND_URL}/api/${caseId}/documents/presign`,
  UPLOAD_DOCUMENT: (caseId: string) => `${BACKEND_URL}/api/cases/${caseId}/documents`,
  COMPLETE_UPLOAD: (caseId: string, docId: string) => `${BACKEND_URL}/api/${caseId}/documents/${docId}/complete`,
  GET_DOCUMENT_BY_ID: (caseId: string, documentId: string) => `${BACKEND_URL}/api/${caseId}/documents/${documentId}`,
  DELETE_DOCUMENT: (caseId: string, documentId: string) => `${BACKEND_URL}/api/cases/${caseId}/documents/${documentId}`,

  // Questions endpoints
  GET_QUESTIONS: (caseId: string) => `${BACKEND_URL}/api/questions/${caseId}`,

  // Session endpoints (LiveKit backend)
  START_SESSION: `${LIVE_BACKEND_URL}/session/start`,
  END_SESSION: (sessionId: string) => `${LIVE_BACKEND_URL}/session/${sessionId}/end`,

  // WebSocket endpoints (LiveKit backend)
  WS_TRANSCRIPT: `${LIVE_BACKEND_URL.replace('http', 'ws')}/ws/transcript`,
} as const;

export default API_ENDPOINTS;
