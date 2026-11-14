import type {
  I18nConfig,
  Locale,
  LocaleSource,
  Messages,
} from "@canonical/i18n-core";
import type { ReactNode } from "react";

/** Value carried by the i18n context: the stable runtime wiring. */
export interface I18nContextValue {
  /** Live locale value shared across the subtree. */
  source: LocaleSource;
  /** Active locale configuration. */
  config: I18nConfig;
  /** Message catalogs keyed by locale. */
  catalogs: Record<Locale, Messages>;
}

/** Props for `I18nProvider`. */
export interface I18nProviderProps {
  /** The subtree that reads the i18n runtime through the hooks. */
  children: ReactNode;
  /** Active locale configuration. */
  config: I18nConfig;
  /** Message catalogs keyed by locale. */
  catalogs: Record<Locale, Messages>;
  /**
   * Initial locale (e.g. SSR-negotiated). Defaults to `config.defaultLocale`.
   * Stored as given, unlike a tag passed to `setLocale`, so pass a configured
   * locale, such as the result of `negotiateLocale`. Ignored when `source` is
   * given: the external source keeps its own locale.
   */
  locale?: Locale;
  /**
   * An existing {@link LocaleSource} to bind to — supply this only to share one
   * locale value across frameworks. When omitted, the provider owns one. When
   * given, the provider creates no source of its own, so `locale` is ignored and
   * the document keeps what this source reflected.
   */
  source?: LocaleSource;
}
