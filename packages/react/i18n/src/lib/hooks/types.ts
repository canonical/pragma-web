import type {
  Direction,
  Formatters,
  Locale,
  Translations,
  Translator,
} from "@canonical/i18n-core";

/**
 * Argument of `useLocalized`: one entry per locale, such as a typed message
 * record per locale. The hook takes it as its one positional argument. The
 * alias is internal: type the argument with `Translations` from
 * `@canonical/i18n-core`.
 *
 * @experimental Typed message records are pre-release: a form that loads a
 * locale on demand may be added in a minor release before 1.0.
 */
export type UseLocalizedProps<T> = Translations<T>;

/**
 * Result of `useLocalized`: the active locale's entry, the same object on
 * every render of that locale. The alias is internal, since the result is the
 * entry's own type.
 *
 * @experimental Typed message records are pre-release and may change in a
 * minor release before 1.0.
 */
export type UseLocalizedResult<T> = T;

/**
 * Props of `useTranslation`, which takes no input. The type is empty and
 * internal: it names the hook's props, as every hook does, and the package
 * does not export it.
 *
 * @deprecated Belongs to the deprecated `useTranslation`; read typed message
 * records with `useLocalized` instead.
 */
export type UseTranslationProps = Record<string, never>;

/**
 * Result of `useTranslation`.
 *
 * @deprecated Returned only by the deprecated `useTranslation`; read typed
 * message records with `useLocalized` instead.
 */
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
  /**
   * Change the active locale. The tag is matched as negotiation matches an
   * `Accept-Language` tag: the exact configured tag first, then its base
   * language, ignoring case, so `setLocale("fr-CA")` selects `"fr"` when only
   * `"fr"` is configured. A tag that matches the current locale changes
   * nothing.
   *
   * @throws RangeError when the tag matches no configured locale.
   */
  setLocale: (tag: Locale) => void;
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
