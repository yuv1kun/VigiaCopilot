
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_GROQ_API_KEY: string | undefined;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
