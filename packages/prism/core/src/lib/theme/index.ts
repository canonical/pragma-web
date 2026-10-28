/**
 * The stored theme: the theme the reader's cookie stores, handed down from
 * the request so a control renders it on the server as on the client.
 *
 * @module
 */

export { default as useStoredTheme } from "./hooks/useStoredTheme.js";
export { default as StoredThemeProvider } from "./Provider.js";
export type { StoredThemeProviderProps } from "./types.js";
