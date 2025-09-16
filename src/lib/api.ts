import { toast } from 'react-hot-toast';
import { APP_CONFIG } from '@/config/app';
import { auth } from './firebase';

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiResponse<T = any> = {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
};

type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: 'json' | 'blob' | 'text';
  signal?: AbortSignal;
};

// Create a custom error class for API errors
class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function to build query string from params
const buildQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Main API request function
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
    auth: requiresAuth = true,
    params = {},
    responseType = 'json',
    signal,
  } = options;

  // Add auth token if required
  if (requiresAuth) {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (requiresAuth) {
      return {
        data: null,
        error: 'Authentication required',
        status: 401,
        success: false,
      };
    }
  }

  // Set default headers
  if (!headers['Content-Type'] && method !== 'GET' && body) {
    headers['Content-Type'] = 'application/json';
  }

  // Build URL with query params
  const url = `${APP_CONFIG.API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal,
    });

    let responseData;
    
    // Handle different response types
    if (responseType === 'blob') {
      responseData = await response.blob();
    } else if (responseType === 'text') {
      responseData = await response.text();
    } else {
      responseData = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || response.statusText || 'An error occurred';
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return {
      data: responseData,
      error: null,
      status: response.status,
      success: true,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    let status = 500;
    
    if (error instanceof ApiError) {
      errorMessage = error.message;
      status = error.status;
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request was cancelled';
      status = 0;
    } else if (error instanceof TypeError) {
      errorMessage = 'Network error. Please check your connection.';
      status = 0;
    }
    
    // Show error toast for non-authentication errors
    if (status !== 401) {
      toast.error(errorMessage);
    }
    
    return {
      data: null,
      error: errorMessage,
      status,
      success: false,
    };
  }
};

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options: Omit<RequestOptions, 'method' | 'params'> = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET', params }),
    
  post: <T = any>(endpoint: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: data }),
    
  put: <T = any>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: data }),
    
  patch: <T = any>(endpoint: string, data: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: data }),
    
  delete: <T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
    
  // File upload helper
  upload: async <T = any>(
    endpoint: string,
    file: File,
    fieldName = 'file',
    additionalData: Record<string, any> = {},
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data to form data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        ...options.headers,
        // Let the browser set the content type with the correct boundary
        'Content-Type': undefined,
      },
    });
  },
};

// Helper function to handle API errors
export const handleApiError = (error: any, defaultMessage = 'An error occurred') => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  console.error('API Error:', error);
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

// Helper function to handle successful API responses
export const handleApiSuccess = <T>(response: ApiResponse<T>, successMessage?: string): T => {
  if (response.success && response.data !== null) {
    if (successMessage) {
      toast.success(successMessage);
    }
    return response.data;
  }
  
  throw new Error(response.error || 'An unknown error occurred');
};

// Helper function to create a cancellable request
export const createCancellableRequest = <T = any>() => {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    request: (endpoint: string, options: Omit<RequestOptions, 'signal'> = {}) => {
      return apiRequest<T>(endpoint, {
        ...options,
        signal: controller.signal,
      });
    },
    cancel: () => {
      controller.abort();
    },
  };
};

export default api;
