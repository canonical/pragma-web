import type { ReactElement } from "react";
import Context from "./Context.js";
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
 *
 * `import { I18nProvider } from "@canonical/i18n-react";`
 *
 * @implements ds:global.provider.i18n
 */
export default function Provider({
  children,
  ...props
}: I18nProviderProps): ReactElement {
  const value = useProviderState(props);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

Provider.displayName = "I18nProvider";
