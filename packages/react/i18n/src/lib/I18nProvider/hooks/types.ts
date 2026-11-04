import type { I18nContextValue, I18nProviderProps } from "../types.js";

/**
 * Props of `useProviderState`: every `I18nProvider` prop except `children`,
 * which the provider renders itself rather than handing to the hook.
 */
export type UseProviderStateProps = Omit<I18nProviderProps, "children">;

/** Result of `useProviderState`: the value the i18n context carries. */
export type UseProviderStateResult = I18nContextValue;
