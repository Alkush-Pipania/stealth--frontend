// Backend API Base URL from environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${BACKEND_URL}/login`,
  SIGNUP: `${BACKEND_URL}/signup`,
  LOGOUT: `${BACKEND_URL}/logout`,

  // Session endpoints
  GET_SESSIONS: `${BACKEND_URL}/sessions`,
  CREATE_SESSION: `${BACKEND_URL}/sessions`,
  GET_SESSION_BY_ID: (id: string) => `${BACKEND_URL}/sessions/${id}`,
  UPDATE_SESSION: (id: string) => `${BACKEND_URL}/sessions/${id}`,
  DELETE_SESSION: (id: string) => `${BACKEND_URL}/sessions/${id}`,

  // Document endpoints
  GET_DOCUMENTS: `${BACKEND_URL}/documents`,
  UPLOAD_DOCUMENT: `${BACKEND_URL}/documents/upload`,
  GET_DOCUMENT_BY_ID: (id: string) => `${BACKEND_URL}/documents/${id}`,
  UPDATE_DOCUMENT: (id: string) => `${BACKEND_URL}/documents/${id}`,
  DELETE_DOCUMENT: (id: string) => `${BACKEND_URL}/documents/${id}`,
} as const;

export default API_ENDPOINTS;
