import { useSyncExternalStore } from "react";
import { useI18nContext } from "../I18nProvider/index.js";
import type { UseLocalizedProps, UseLocalizedResult } from "./types.js";

/**
 * Read the active locale's entry from one value per locale, typically a typed
 * message record built once per locale by its factory. Re-renders the calling
 * component when the locale changes.
 *
 * The result is the very object stored for the active locale, so its identity
 * changes only when the locale does, and a memoized child that receives it
 * re-renders once per switch. Keep `translations` at module scope for that.
 *
 * @param translations - One entry per configured locale. Type it with
 *   `Translations<T, AppLocale>` so a missing locale fails to compile.
 * @returns The active locale's entry.
 * @throws Error when the active locale has no entry. Every configured locale
 *   needs one, and a locale stored as given, such as a provider's `locale`
 *   prop that is not configured, has none.
 * @experimental Typed message records are pre-release: a form that loads a
 *   locale on demand may be added in a minor release before 1.0.
 */
export default function useLocalized<T>(
  translations: UseLocalizedProps<T>,
): UseLocalizedResult<T> {
  const { source } = useI18nContext();
  const locale = useSyncExternalStore(source.subscribe, source.get, source.get);
  const translation = translations[locale];

  if (translation === undefined) {
    throw new Error(`No translation for the active locale "${locale}".`);
  }

  return translation;
}
