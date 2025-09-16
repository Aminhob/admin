// Application configuration
export const APP_CONFIG = {
  // App metadata
  NAME: import.meta.env.VITE_APP_NAME || 'Telegram Mini App Admin',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  
  // Feature flags
  FEATURES: {
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    LOGGING: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    PREFIX: 'telegram_admin_',
    AUTH: 'auth',
    THEME: 'theme',
    LANG: 'language',
  },
  
  // Default theme
  THEME: {
    DEFAULT: 'light',
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system',
  },
  
  // Default language
  LANG: {
    DEFAULT: 'en',
    SUPPORTED: ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar'],
  },
  
  // User roles
  ROLES: {
    ADMIN: 'admin',
    AGENT: 'agent',
    USER: 'user',
  },
  
  // License types
  LICENSE_TYPES: {
    TRIAL: 'trial',
    BASIC: 'basic',
    PRO: 'pro',
    ENTERPRISE: 'enterprise',
  },
  
  // Date and time formats
  FORMATS: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm',
    DATETIME: 'YYYY-MM-DD HH:mm',
    HUMAN_DATE: 'MMM D, YYYY',
    HUMAN_DATETIME: 'MMM D, YYYY HH:mm',
  },
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    USERS: {
      BASE: '/users',
      ME: '/users/me',
      ROLES: '/users/roles',
    },
    AGENTS: {
      BASE: '/agents',
      STATS: '/agents/stats',
    },
    LICENSES: {
      BASE: '/licenses',
      VALIDATE: '/licenses/validate',
      TYPES: '/licenses/types',
    },
    REPORTS: {
      BASE: '/reports',
      SALES: '/reports/sales',
      USAGE: '/reports/usage',
      PERFORMANCE: '/reports/performance',
    },
  },
  
  // Default error messages
  MESSAGES: {
    ERROR: {
      DEFAULT: 'An error occurred. Please try again later.',
      NETWORK: 'Network error. Please check your connection and try again.',
      UNAUTHORIZED: 'You are not authorized to access this resource.',
      FORBIDDEN: 'You do not have permission to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      SERVER: 'A server error occurred. Please try again later.',
      VALIDATION: 'Please check your input and try again.',
    },
    SUCCESS: {
      SAVED: 'Your changes have been saved successfully.',
      CREATED: 'The item has been created successfully.',
      UPDATED: 'The item has been updated successfully.',
      DELETED: 'The item has been deleted successfully.',
    },
  },
};

// Export types
export type AppConfig = typeof APP_CONFIG;
export type AppRole = typeof APP_CONFIG.ROLES[keyof typeof APP_CONFIG.ROLES];
export type LicenseType = typeof APP_CONFIG.LICENSE_TYPES[keyof typeof APP_CONFIG.LICENSE_TYPES];

// Helper function to check if user has required role
export const hasRole = (userRole: AppRole, requiredRole: AppRole): boolean => {
  const roleHierarchy: Record<AppRole, number> = {
    [APP_CONFIG.ROLES.ADMIN]: 3,
    [APP_CONFIG.ROLES.AGENT]: 2,
    [APP_CONFIG.ROLES.USER]: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Helper function to format dates
export const formatDate = (date: Date | string | number, format: string = APP_CONFIG.FORMATS.DATE): string => {
  const d = new Date(date);
  
  const pad = (n: number): string => n.toString().padStart(2, '0');
  
  const formats: Record<string, string> = {
    'YYYY': d.getFullYear().toString(),
    'MM': pad(d.getMonth() + 1),
    'DD': pad(d.getDate()),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds()),
  };
  
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => formats[match] || match);
};

// Helper function to get human-readable time ago
export const timeAgo = (date: Date | string | number): string => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to truncate text
export const truncate = (text: string, maxLength: number = 100, ellipsis: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + ellipsis;
};

// Helper function to generate a unique ID
export const generateId = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// Helper function to validate email
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function to format phone number
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Check if the number is valid
  const match = cleaned.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
  
  if (match) {
    return !match[2] 
      ? match[1] 
      : `+${match[1]} (${match[2]}) ${match[3]}`;
  }
  
  return phone;
};

// Export default configuration
export default APP_CONFIG;
