/// <reference types="@vitest/browser/matchers" />

// Place any code that must be run to configure clientside (Playwright)
// tests here.

import type { EmulatedMedia } from "./vite.config.js";

declare module "vitest/browser" {
  interface BrowserCommands {
    /** Sets operating-system media preferences, defined in vite.config.ts. */
    emulateMedia: (media: EmulatedMedia) => Promise<void>;
  }
}

export {};
