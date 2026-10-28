import { createContext } from "react";
import type { StoredThemeContextOptions } from "./types.js";

/**
 * Leave the stored theme as it is: with no provider mounted, nothing holds
 * it, and a theme control reads the cookie on each mount instead.
 */
function ignoreStoredTheme(): void {}

/**
 * The theme the reader's cookie stores, and its setter. Its default holds
 * no stored theme and ignores the setter: a page rendered with no provider
 * mounted reads the cookie on the client alone.
 */
const StoredThemeContext = createContext<StoredThemeContextOptions>({
  theme: undefined,
  setTheme: ignoreStoredTheme,
});

export default StoredThemeContext;
