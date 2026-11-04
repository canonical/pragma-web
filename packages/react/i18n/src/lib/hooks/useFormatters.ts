import { createFormatters } from "@canonical/i18n-core";
import { useMemo, useSyncExternalStore } from "react";
import { useI18nContext } from "../I18nProvider/index.js";
import type { UseFormattersResult } from "./types.js";

/**
 * Access memoized `Formatters` (number, currency, date, time, relative
 * time, list) for the active locale. Re-renders on locale change.
 */
export default function useFormatters(): UseFormattersResult {
  const { source } = useI18nContext();
  const locale = useSyncExternalStore(source.subscribe, source.get, source.get);

  return useMemo(() => createFormatters(locale), [locale]);
}
