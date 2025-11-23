import { tokenManager } from '@/action/server';

/**
 * Check if user is authenticated by verifying token exists in localStorage
 */
export const isAuthenticated = (): boolean => {
  const token = tokenManager.getToken();
  return !!token; // Returns true if token exists, false otherwise
};

/**
 * Clear authentication and logout user
 */
export const logout = (): void => {
  tokenManager.removeToken();
};

/**
 * Get current auth token
 */
export const getAuthToken = (): string | null => {
  return tokenManager.getToken();
};
