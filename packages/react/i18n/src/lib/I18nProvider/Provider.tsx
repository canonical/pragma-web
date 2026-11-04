import type { ReactElement } from "react";
import I18nContext from "./Context.js";
import { useProviderState } from "./hooks/index.js";
import type { I18nProviderProps } from "./types.js";

/**
 * Provide the i18n runtime to the `useTranslation`, `useLocale`, and
 * `useFormatters` hooks. Mount once around the subtree that renders localized
 * content.
 *
 * Pass the SSR-negotiated `locale` so the server and first client render agree.
 * Supply an external `source` only to share one locale value across frameworks;
 * otherwise the provider owns it.
 */
export default function I18nProvider({
  children,
  ...props
}: I18nProviderProps): ReactElement {
  const value = useProviderState(props);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
