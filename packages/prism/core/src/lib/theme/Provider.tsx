import type { ReactElement } from "react";
import StoredThemeContext from "./Context.js";
import type { StoredThemeProviderProps } from "./types.js";

/**
 * Provides the theme the reader's cookie stores to every `useStoredTheme`
 * below it, so a control that shows the stored theme renders it on the
 * server, which cannot read the cookie from the document, as it does on
 * the client. A site's shell mounts it with the theme its server read off
 * the request, and its client entry with the same value from the page's
 * initial data, so the server and the hydrating client render alike.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { StoredThemeProvider } from "@canonical/prism-core";`
 */
export default function StoredThemeProvider({
  theme,
  children,
}: StoredThemeProviderProps): ReactElement {
  return <StoredThemeContext value={theme}>{children}</StoredThemeContext>;
}
