import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Token management
const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getUserId: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(USER_ID_KEY);
    }
    return null;
  },

  setUserId: (userId: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ID_KEY, userId);
    }
  },

  removeUserId: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_ID_KEY);
    }
  },
};

// Common request options interface
interface RequestOptions {
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
}

// Generic API response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Build headers with optional authentication
const buildHeaders = (customHeaders?: Record<string, string>, includeAuth = true): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add JWT token if available and includeAuth is true
  if (includeAuth) {
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Handle API response
const handleResponse = <T>(response: any): ApiResponse<T> => {
  return {
    success: true,
    data: response.data,
    message: response.data?.message,
  };
};

// Handle API error
const handleError = (error: unknown): ApiResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Server responded with error status
    if (axiosError.response) {
      return {
        success: false,
        error: axiosError.response.data?.error ||
               axiosError.response.data?.message ||
               `Request failed with status ${axiosError.response.status}`,
        data: axiosError.response.data,
      };
    }

    // Request was made but no response received
    if (axiosError.request) {
      return {
        success: false,
        error: 'No response from server. Please check your connection.',
      };
    }
  }

  // Something else happened
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
  };
};

/**
 * GET request
 */
export async function apiGet<T = any>(
  url: string,
  options: Omit<RequestOptions, 'body'> = {}
): Promise<ApiResponse<T>> {
  try {
    const { headers, includeAuth = true } = options;

    const config: AxiosRequestConfig = {
      method: 'GET',
      url,
      headers: buildHeaders(headers, includeAuth),
    };

    const response = await axios(config);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const { body, headers, includeAuth = true } = options;

    const config: AxiosRequestConfig = {
      method: 'POST',
      url,
      data: body,
      headers: buildHeaders(headers, includeAuth),
    };

    const response = await axios(config);
    console.log(response)
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const { body, headers, includeAuth = true } = options;

    const config: AxiosRequestConfig = {
      method: 'PUT',
      url,
      data: body,
      headers: buildHeaders(headers, includeAuth),
    };

    const response = await axios(config);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  options: Omit<RequestOptions, 'body'> = {}
): Promise<ApiResponse<T>> {
  try {
    const { headers, includeAuth = true } = options;

    const config: AxiosRequestConfig = {
      method: 'DELETE',
      url,
      headers: buildHeaders(headers, includeAuth),
    };

    const response = await axios(config);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH request
 */
export async function apiPatch<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const { body, headers, includeAuth = true } = options;

    const config: AxiosRequestConfig = {
      method: 'PATCH',
      url,
      data: body,
      headers: buildHeaders(headers, includeAuth),
    };

    const response = await axios(config);
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
}
