/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK_API: 'true' | 'false'
  readonly VITE_ENABLE_ANALYTICS: 'true' | 'false'
  readonly VITE_ENABLE_LOGGING: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
