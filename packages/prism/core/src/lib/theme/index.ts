/**
 * The stored theme: the theme the reader's cookie stores, seeded from the
 * request so a control renders it on the server as on the client, then kept
 * current by the control as the reader changes it.
 *
 * @module
 */

export { default as useStoredTheme } from "./hooks/useStoredTheme.js";
export { default as StoredThemeProvider } from "./Provider.js";
export type { StoredThemeProviderProps } from "./types.js";
