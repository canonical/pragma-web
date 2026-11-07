import type { I18nContextValue, I18nProviderProps } from "../types.js";

/**
 * Props of `useProviderState`: every `I18nProvider` prop except `children`,
 * which the provider renders itself rather than handing to the hook.
 */
export type UseProviderStateProps = Omit<I18nProviderProps, "children">;

/** Result of `useProviderState`: the value the i18n context carries. */
export type UseProviderStateResult = I18nContextValue;

/**
 * Props of `useI18nContext`, which takes no input. The type is empty and
 * internal: it names the hook's props, as every hook does, and the package
 * does not export it.
 */
export type UseI18nContextProps = Record<string, never>;

/**
 * Result of `useI18nContext`: the value the i18n context carries. The alias is
 * internal; the package exports `I18nContextValue` itself.
 */
export type UseI18nContextResult = I18nContextValue;
