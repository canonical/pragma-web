/**
 * Static data shared by the i18n-react tests.
 *
 * Each export is a plain value a test reads and never mutates.
 */

import type {
  I18nConfig,
  Locale,
  LocaleSourceOptions,
  Messages,
} from "@canonical/i18n-core";

/** Three locales, one of them right-to-left. */
export const localeConfig: I18nConfig = {
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
  rtlLocales: ["ar"],
};

/** Two regional locales, for checking locale-specific formatting. */
export const formattingConfig: I18nConfig = {
  locales: ["en-US", "fr-FR"],
  defaultLocale: "en-US",
};

/** Catalogs for `useTranslation`; Arabic has none on purpose. */
export const greetingCatalogs: Record<Locale, Messages> = {
  en: { greeting: "Hello, {name}!" },
  fr: { greeting: "Bonjour, {name} !" },
};

/** Catalogs with no entries, for tests that read no message. */
export const emptyCatalogs: Record<Locale, Messages> = {};

/** Locale source options that turn off both browser effects. */
export const effectsOff: LocaleSourceOptions = {
  persist: false,
  reflect: false,
};
