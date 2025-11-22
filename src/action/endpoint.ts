import { BACKEND_URL } from '@/config/env';

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
  GET_DOCUMENTS: `${BACKEND_URL}/documents`,
  UPLOAD_DOCUMENT: `${BACKEND_URL}/documents/upload`,
  GET_DOCUMENT_BY_ID: (id: string) => `${BACKEND_URL}/documents/${id}`,
  UPDATE_DOCUMENT: (id: string) => `${BACKEND_URL}/documents/${id}`,
  DELETE_DOCUMENT: (id: string) => `${BACKEND_URL}/documents/${id}`,
} as const;

export default API_ENDPOINTS;
