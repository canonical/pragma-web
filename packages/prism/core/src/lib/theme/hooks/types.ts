import type {
  StoredThemeContextOptions,
  StoredThemeProviderProps,
} from "../types.js";

/** The props `useProviderState` takes: the provider's, without children. */
export type UseProviderStateProps = Omit<StoredThemeProviderProps, "children">;

/** What `useProviderState` returns: the value the provider hands down. */
export type UseProviderStateResult = StoredThemeContextOptions;

/**
 * What `useStoredTheme` returns: the theme the reader's cookie stores, or
 * `undefined` when it stores none or no provider is mounted, and the setter
 * that records the reader's choice.
 */
export type UseStoredThemeResult = StoredThemeContextOptions;
