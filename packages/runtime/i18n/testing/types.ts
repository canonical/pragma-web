/**
 * Types used only by the i18n-core tests.
 */

/** The parts of `document` a locale source writes in the browser. */
export type FakeDocument = {
  cookie: string;
  documentElement: { lang: string; dir: string };
};
