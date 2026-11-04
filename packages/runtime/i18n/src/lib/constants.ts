/** Cookie name used to persist a locale choice when none is configured. */
export const DEFAULT_COOKIE_NAME = "locale";

/** Lifetime, in seconds, of the persisted locale cookie (one year). */
export const COOKIE_MAX_AGE = 31_536_000;

/**
 * Every CLDR plural category, in the order CLDR lists them. Strict formatters
 * name missing forms in this order, whatever order `Intl` reports them in.
 */
export const PLURAL_CATEGORIES = [
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
] as const;
