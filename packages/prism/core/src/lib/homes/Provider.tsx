import type { ReactElement } from "react";
import HomesContext from "./Context.js";
import type { HomesProviderProps } from "./types.js";

/**
 * Provides the site's homes — where each kind of graph node lives — to every
 * `useHome` below it. Mount it above the routed content, inside the router.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { HomesProvider } from "@canonical/prism-core";`
 */
export default function HomesProvider({
  homes,
  children,
}: HomesProviderProps): ReactElement {
  return <HomesContext value={homes}>{children}</HomesContext>;
}
