import type { ReactElement } from "react";
import LensFilterContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { LensFilterProviderProps } from "./types.js";

/**
 * Provides the reader's filter, search text and region request to the
 * strip's chips and the explorer below it, with the memory of the graph's
 * camera. `DefinitionsLayout` puts it around both. The router mounts the
 * layout again whenever the matched route changes, so the provider keeps
 * the reader's choices and the camera in the session of the router in
 * scope: they survive a move from the lens index to a term and back, or
 * from one term to another, and a fresh page load or a server render
 * starts from the defaults.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { LensFilterProvider } from "./LensFilterProvider/index.js";`
 */
export default function LensFilterProvider({
  children,
}: LensFilterProviderProps): ReactElement {
  const value = useProviderState();
  return <LensFilterContext value={value}>{children}</LensFilterContext>;
}
