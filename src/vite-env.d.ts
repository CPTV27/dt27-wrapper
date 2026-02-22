/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCOUT_SPREADSHEET_ID: string;
  readonly VITE_OPERATOR_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
