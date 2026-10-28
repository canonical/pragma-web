import { useContext } from "react";
import StoredThemeContext from "../Context.js";
import type { UseStoredThemeResult } from "./types.js";

/**
 * Read the theme the reader's cookie stores, as the request carried it:
 * the value the nearest `StoredThemeProvider` holds.
 *
 * @returns The stored theme, or `undefined` when the cookie stores none or
 *   no provider is mounted.
 */
export default function useStoredTheme(): UseStoredThemeResult {
  return useContext(StoredThemeContext);
}
