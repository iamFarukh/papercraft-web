/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  /** Dev-only role override; honored only in dev builds (import.meta.env.DEV). */
  readonly VITE_DEV_ROLE?: 'admin' | 'teacher' | ''
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.lottie' {
  const src: string
  export default src
}
