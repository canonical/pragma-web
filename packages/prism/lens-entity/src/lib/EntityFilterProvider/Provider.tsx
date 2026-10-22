import type { ReactElement } from "react";
import EntityFilterContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { EntityFilterProviderProps } from "./types.js";

/**
 * Provides the reader's filter to the strip's controls and the index below
 * it. `EntityLayout` puts it around both, and it lives as long as the
 * layout, which the router remounts whenever the matched route changes: the
 * filter starts from its default on every visit to the index.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { EntityFilterProvider } from "./EntityFilterProvider/index.js";`
 */
export default function EntityFilterProvider({
  children,
}: EntityFilterProviderProps): ReactElement {
  const value = useProviderState();
  return <EntityFilterContext value={value}>{children}</EntityFilterContext>;
}
