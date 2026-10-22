/// <reference types="@vitest/browser/matchers" />

// Place any code that must be run to configure clientside (Playwright)
// tests here.

declare module "vitest/browser" {
  interface BrowserCommands {
    /** Sets operating-system media preferences, defined in vite.config.ts. */
    emulateMedia: (media: {
      reducedMotion: "reduce" | "no-preference";
    }) => Promise<void>;
  }
}

export {};
