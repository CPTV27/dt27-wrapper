/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCOUT_SPREADSHEET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
