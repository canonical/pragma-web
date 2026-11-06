import {
  createLocaleSource,
  type I18nConfig,
  type Locale,
  type LocaleSource,
} from "@canonical/i18n-core";
import { type RefObject, useMemo, useRef } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Get the provider's own locale source, creating it on first use.
 *
 * @note - This function is impure - it writes the created source into `ref`,
 * and creating it reflects the initial locale onto `<html lang dir>` in the
 * browser.
 */
function getOwnSource(
  ref: RefObject<LocaleSource | null>,
  config: I18nConfig,
  locale: Locale | undefined,
): LocaleSource {
  ref.current ??= createLocaleSource(config, { initial: locale });
  return ref.current;
}

/**
 * Hold the state of an `I18nProvider`: the locale source it reads, owned or
 * external, with its config and catalogs, memoized so the context value keeps
 * its identity until one of them changes.
 *
 * @param props - The provider's props, without `children`.
 * @returns The value the i18n context carries.
 * @note - This function is impure - the first render without an external
 * `source` creates the provider's own locale source, which in the browser
 * reflects the initial locale onto `<html lang dir>`, so the page names its
 * language from the start. While a `source` is given, it creates none, so the
 * document keeps what that source reflected.
 */
export default function useProviderState({
  config,
  catalogs,
  locale,
  source,
}: UseProviderStateProps): UseProviderStateResult {
  const ownSource = useRef<LocaleSource | null>(null);
  const activeSource = source ?? getOwnSource(ownSource, config, locale);

  return useMemo(
    () => ({ source: activeSource, config, catalogs }),
    [activeSource, config, catalogs],
  );
}
