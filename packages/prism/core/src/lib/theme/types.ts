import type { Theme } from "@canonical/react-hooks";
import type { ReactNode } from "react";

/** Props accepted by `StoredThemeProvider`. */
export interface StoredThemeProviderProps {
  /**
   * The theme the reader's cookie stores, as the request carried it, or
   * `undefined` when it stores none and the page follows the system's.
   */
  readonly theme?: Theme;
  /** The content that reads the stored theme, such as the theme control. */
  readonly children: ReactNode;
}
