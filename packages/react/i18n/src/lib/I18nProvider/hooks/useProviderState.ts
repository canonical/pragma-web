import { createLocaleSource } from "@canonical/i18n-core";
import { useMemo, useState } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Hold the state of an `I18nProvider`: the locale source it reads, owned or
 * external, with its config and catalogs, memoized so the context value keeps
 * its identity until one of them changes.
 *
 * @param props - The provider's props, without `children`.
 * @returns The value the i18n context carries.
 * @note - This function is impure - on its first render it creates the
 * provider's own locale source, which in the browser reflects the initial
 * locale onto `<html lang dir>`, so the page names its language from the start.
 */
export default function useProviderState({
  config,
  catalogs,
  locale,
  source,
}: UseProviderStateProps): UseProviderStateResult {
  const [ownSource] = useState(() =>
    createLocaleSource(config, { initial: locale }),
  );
  const activeSource = source ?? ownSource;

  return useMemo(
    () => ({ source: activeSource, config, catalogs }),
    [activeSource, config, catalogs],
  );
}
