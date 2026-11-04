import type {
  Direction,
  Formatters,
  Locale,
  Translator,
} from "@canonical/i18n-core";

/**
 * Props of `useTranslation`, which takes no input. The type is empty and
 * internal: it names the hook's props, as every hook does, and the package
 * does not export it.
 */
export type UseTranslationProps = Record<string, never>;

/** Result of `useTranslation`. */
export interface UseTranslationResult {
  /** Translate a key for the active locale. */
  t: Translator;
  /** Active locale. */
  locale: Locale;
  /** Writing direction of the active locale. */
  direction: Direction;
}

/**
 * Props of `useLocale`, which takes no input. The type is empty and internal:
 * it names the hook's props, as every hook does, and the package does not
 * export it.
 */
export type UseLocaleProps = Record<string, never>;

/** Result of `useLocale`. */
export interface UseLocaleResult {
  /** Active locale. */
  locale: Locale;
  /** Writing direction of the active locale. */
  direction: Direction;
  /** Change the active locale. */
  setLocale: (locale: Locale) => void;
  /** Every configured locale, for building a selector. */
  locales: readonly Locale[];
}

/**
 * Props of `useFormatters`, which takes no input. The type is empty and
 * internal: it names the hook's props, as every hook does, and the package
 * does not export it.
 */
export type UseFormattersProps = Record<string, never>;

/**
 * Result of `useFormatters`: memoized formatters for the active locale. The
 * alias is internal; the package exports the `Formatters` interface itself.
 */
export type UseFormattersResult = Formatters;
