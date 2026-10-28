import type { Theme } from "@canonical/react-hooks";
import type { ReactNode } from "react";

/** Props accepted by `StoredThemeProvider`. */
export interface StoredThemeProviderProps {
  /**
   * The theme the reader's cookie stores, as the request carried it, or
   * `undefined` when it stores none and the page follows the system's. It
   * seeds the provider once, on its first render; later values are ignored,
   * so the reader's choices made since then are kept.
   */
  readonly theme?: Theme;
  /** The content that reads the stored theme, such as the theme control. */
  readonly children: ReactNode;
}

/**
 * What the stored-theme context holds: the theme the reader's cookie stores
 * now, and the setter a theme control calls when the reader changes it.
 */
export interface StoredThemeContextOptions {
  /** The stored theme, or `undefined` when none is stored. */
  readonly theme: Theme | undefined;
  /**
   * Record the reader's choice: a theme they stored, or `undefined` when
   * they cleared it to follow the system's.
   */
  readonly setTheme: (theme: Theme | undefined) => void;
}
