import type { ReactElement } from "react";
import StoredThemeContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { StoredThemeProviderProps } from "./types.js";

/**
 * Provides the theme the reader's cookie stores to every `useStoredTheme`
 * below it, so a control that shows the stored theme renders it on the
 * server, which cannot read the cookie from the document, as it does on
 * the client. A site's shell mounts it with the theme its server read off
 * the request, and its client entry with the same value from the page's
 * initial data, so the server and the hydrating client render alike.
 *
 * The request's theme only seeds it: the theme control records each choice
 * the reader makes, so a control that mounts later in the session, such as
 * the one in another route's rail, shows the reader's latest choice and
 * never restores the request's.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { StoredThemeProvider } from "@canonical/prism-core";`
 */
export default function StoredThemeProvider({
  children,
  ...props
}: StoredThemeProviderProps): ReactElement {
  const value = useProviderState(props);

  return <StoredThemeContext value={value}>{children}</StoredThemeContext>;
}
