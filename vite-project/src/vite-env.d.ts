// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOKEN_KEY: string;
  // 添加其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}