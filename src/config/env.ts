/**
 * Environment Configuration
 *
 * Centralized configuration for all environment variables.
 * This provides type safety, default values, and a single source of truth.
 */

interface EnvConfig {
  // Backend API
  BACKEND_URL: string;
  LIVE_BACKEND_URL: string;

  // App Configuration
  APP_ENV: 'development' | 'production' | 'test';
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;

  // Optional: Add more configs as needed
  // API_TIMEOUT?: number;
  // MAX_FILE_SIZE?: number;
}

// Helper function to get environment variable with fallback
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side - only NEXT_PUBLIC_ variables are available
    return (window as any).__ENV__?.[key] || process.env[`NEXT_PUBLIC_${key}`] || defaultValue;
  }
  // Server-side
  return process.env[`NEXT_PUBLIC_${key}`] || process.env[key] || defaultValue;
};

// Environment configuration object
export const env: EnvConfig = {
  // Backend API URL
  BACKEND_URL: getEnvVar('BACKEND_URL', 'http://localhost:4000'),
  // LiveKit Backend API URL
  LIVE_BACKEND_URL: getEnvVar('LIVE_BACKEND_URL', 'http://localhost:8000'),

  // App Environment
  APP_ENV: (getEnvVar('NODE_ENV', 'development') as EnvConfig['APP_ENV']),
  IS_PRODUCTION: getEnvVar('NODE_ENV') === 'production',
  IS_DEVELOPMENT: getEnvVar('NODE_ENV') === 'development',
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars: (keyof EnvConfig)[] = ['BACKEND_URL', 'LIVE_BACKEND_URL'];

  const missing = requiredVars.filter(key => !env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}\n` +
      `Using default values. Set NEXT_PUBLIC_BACKEND_URL and NEXT_PUBLIC_LIVE_BACKEND_URL in your .env.local file.`
    );
  }
};

// Run validation in development
if (env.IS_DEVELOPMENT && typeof window === 'undefined') {
  validateEnv();
}

// Export individual values for convenience
export const {
  BACKEND_URL,
  LIVE_BACKEND_URL,
  APP_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
} = env;

// Export default
export default env;
