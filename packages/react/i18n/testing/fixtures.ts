/**
 * Static data shared by the i18n-react tests.
 *
 * Each export is a plain value a test reads and never mutates.
 */

import {
  createFormatters,
  type Formatters,
  type I18nConfig,
  type Locale,
  type LocaleSourceOptions,
  type Messages,
  type Translations,
} from "@canonical/i18n-core";
import type { Greetings, Rows } from "./types.js";

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

/** One label per configured locale, for reading per-locale data that is not a record. */
export const nameLabels: Translations<string, "en" | "fr" | "ar"> = {
  en: "Name",
  fr: "Nom",
  ar: "الاسم",
};

function createEnglishGreetings(f: Formatters): Greetings {
  return {
    heading: "Welcome",
    greeting: (name) => `Hello, ${f.isolate(name)}!`,
    items: (count) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} item`,
        other: `${f.formatNumber(count)} items`,
      }),
  };
}

function createFrenchGreetings(f: Formatters): Greetings {
  return {
    heading: "Bienvenue",
    greeting: (name) => `Bonjour, ${f.isolate(name)} !`,
    items: (count) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} article`,
        many: `${f.formatNumber(count)} d’articles`,
        other: `${f.formatNumber(count)} articles`,
      }),
  };
}

/**
 * Greetings in English and French. Arabic is configured in `localeConfig` but
 * has no entry, so a test can reach the missing-entry throw.
 */
export const greetings = {
  en: createEnglishGreetings(createFormatters("en")),
  fr: createFrenchGreetings(createFormatters("fr")),
} satisfies Translations<Greetings, "en" | "fr">;

function createEnglishRows(f: Formatters): Rows {
  return {
    rowsSelected: (count) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} row selected`,
        other: `${f.formatNumber(count)} rows selected`,
      }),
  };
}

function createFrenchRows(f: Formatters): Rows {
  return {
    rowsSelected: (count) =>
      f.selectPlural(count, {
        one: `${f.formatNumber(count)} ligne sélectionnée`,
        many: `${f.formatNumber(count)} de lignes sélectionnées`,
        other: `${f.formatNumber(count)} lignes sélectionnées`,
      }),
  };
}

/** Row-selection messages in English and French, again with no Arabic entry. */
export const rows = {
  en: createEnglishRows(createFormatters("en")),
  fr: createFrenchRows(createFormatters("fr")),
} satisfies Translations<Rows, "en" | "fr">;
