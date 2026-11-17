/**
 * Types used only by the i18n-core tests.
 */

/** The parts of `document` a locale source writes in the browser. */
export type FakeDocument = {
  cookie: string;
  documentElement: { lang: string; dir: string };
};

/** Two locales, for checking that a per-locale set needs each one. */
export type TwoLocales = "en" | "fr";

/** A one-member record whose message words a count of items. */
export type ItemMessages = {
  readonly items: (count: number) => string;
};
