/// <reference types="vite/client" />

// The one environment variable the package reads, spelled so that bundlers
// replace it: `process.env.NODE_ENV`, which they match as a token.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV?: "development" | "production" | "test";
  }
}
