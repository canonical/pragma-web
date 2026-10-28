import { useContext } from "react";
import StoredThemeContext from "../Context.js";
import type { UseStoredThemeResult } from "./types.js";

/**
 * Read the theme the reader's cookie stores, as the nearest
 * `StoredThemeProvider` holds it: first the request's, then the latest the
 * reader chose, recorded through the returned `setTheme`.
 *
 * @returns The stored theme (`undefined` when the cookie stores none or no
 *   provider is mounted) and its setter (a no-op with no provider mounted).
 */
export default function useStoredTheme(): UseStoredThemeResult {
  return useContext(StoredThemeContext);
}
