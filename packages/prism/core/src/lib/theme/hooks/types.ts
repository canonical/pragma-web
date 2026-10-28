import type { Theme } from "@canonical/react-hooks";

/**
 * What `useStoredTheme` returns: the theme the reader's cookie stores, or
 * `undefined` when it stores none or no provider is mounted.
 */
export type UseStoredThemeResult = Theme | undefined;
