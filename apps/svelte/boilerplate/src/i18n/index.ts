/** @module App-local i18n: locale configuration, message catalogs and the locale context. */
import {
  createFormatters,
  createTranslator,
  type LocaleSource,
} from "@canonical/i18n-core";
import { getContext, setContext } from "svelte";
import { catalogs } from "./catalogs";
import type { AppLocale } from "./config";
import type { MessageKey } from "./en";

export { catalogs } from "./catalogs";
export { type AppLocale, i18nConfig } from "./config";
export type { MessageKey } from "./en";

const localeKey = Symbol("locale");

/** Provides the locale source to every component below the caller. */
export function setLocaleSource(source: LocaleSource): void {
  setContext(localeKey, source);
}

/** Reads the locale source the root layout provides. */
export function getLocaleSource(): LocaleSource {
  return getContext<LocaleSource>(localeKey);
}

/**
 * Creates the translator for `locale`. Keys are typed against the English
 * catalog, as `useTranslation` types them in the React app.
 */
export function createAppTranslator(locale: string) {
  const translate = createTranslator(
    locale,
    catalogs[locale as AppLocale] ?? catalogs.en,
  );

  return (key: MessageKey, vars?: Record<string, string | number>): string =>
    translate(key, vars);
}

/** Creates the memoized `Intl` formatters for `locale`. */
export function createAppFormatters(locale: string) {
  return createFormatters(locale);
}
