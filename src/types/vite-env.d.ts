/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_LIVE_API_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_DEBUG_MODE: string
    readonly VITE_MRA_ENVIRONMENT: 'PRODUCTION' | 'SANDBOX'
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}