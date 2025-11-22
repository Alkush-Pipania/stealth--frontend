// Token management
const TOKEN_KEY = 'auth_token';

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
const buildHeaders = (customHeaders?: Record<string, string>, includeAuth = true): HeadersInit => {
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
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    return {
      success: false,
      error: data?.error || data?.message || `Request failed with status ${response.status}`,
      data: data,
    };
  }

  return {
    success: true,
    data: data,
    message: data?.message,
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

    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(headers, includeAuth),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
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

    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(headers, includeAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return await handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
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

    const response = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(headers, includeAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return await handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
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

    const response = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(headers, includeAuth),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
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

    const response = await fetch(url, {
      method: 'PATCH',
      headers: buildHeaders(headers, includeAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return await handleResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
