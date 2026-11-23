/**
 * Static data shared by the i18n-core tests.
 *
 * Each export is a plain value a test reads and never mutates.
 */

import type {
  I18nConfig,
  LocaleSourceOptions,
  Messages,
  PluralRecord,
} from "../src/lib/index.js";

/** Three locales, one of them right-to-left. */
export const localeConfig: I18nConfig = {
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
  rtlLocales: ["ar"],
};

/** The same three locales with no right-to-left list, for negotiation. */
export const negotiationConfig: I18nConfig = {
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
};

/** A regional tag configured without its base language. */
export const regionalOnlyConfig: I18nConfig = {
  locales: ["en", "fr-CA"],
  defaultLocale: "en",
};

/** A base language configured beside one of its regional tags. */
export const baseAndRegionalConfig: I18nConfig = {
  locales: ["en", "fr", "fr-CA"],
  defaultLocale: "en",
};

/** Base languages beside a regional tag of another language. */
export const mixedRegionConfig: I18nConfig = {
  locales: ["en", "fr", "pt-BR"],
  defaultLocale: "en",
};

/** English and Arabic, with Arabic marked right-to-left. */
export const englishArabicConfig: I18nConfig = {
  locales: ["en", "ar"],
  defaultLocale: "en",
  rtlLocales: ["ar"],
};

/** English and Arabic, with two right-to-left base languages listed. */
export const rightToLeftConfig: I18nConfig = {
  locales: ["en", "ar"],
  defaultLocale: "en",
  rtlLocales: ["ar", "he"],
};

/** Arabic only, with no right-to-left list. */
export const unlistedDirectionConfig: I18nConfig = {
  locales: ["ar"],
  defaultLocale: "ar",
};

/** A catalog with plain, interpolated and plural entries in two languages. */
export const translatorCatalog: Messages = {
  "nav.home": "Home",
  greeting: "Hello, {name}!",
  pair: "{a} and {b}",
  items: { one: "{count} item", other: "{count} items" },
  arItems: {
    zero: "لا عناصر",
    one: "عنصر",
    two: "عنصران",
    few: "{count} عناصر",
    many: "{count} عنصرًا",
    other: "{count} عنصر",
  },
};

/** A two-entry catalog that `mergeCatalogs` layers overrides onto. */
export const baseCatalog: Messages = { a: "base-a", b: "base-b" };

/** Locale source options that turn off both browser effects. */
export const effectsOff: LocaleSourceOptions = {
  persist: false,
  reflect: false,
};

/** Arabic forms for a count of items, one per CLDR category Arabic uses. */
export const arabicItemForms: PluralRecord = {
  zero: "لا عناصر",
  one: "عنصر",
  two: "عنصران",
  few: "3 عناصر",
  many: "11 عنصرًا",
  other: "100 عنصر",
};
