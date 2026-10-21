import type { ReactElement } from "react";
import LensFilterContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { LensFilterProviderProps } from "./types.js";

/**
 * Provides the reader's filter to the strip's chips and the explorer below
 * it. `DefinitionsLayout` puts it around both, and it lives as long as the
 * layout, which the router remounts whenever the matched route changes: the
 * filter survives a move from one term to another (the same route, new
 * params) and starts from its default on a move to the lens index or to
 * another lens.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { LensFilterProvider } from "./LensFilter/index.js";`
 */
export default function LensFilterProvider({
  children,
}: LensFilterProviderProps): ReactElement {
  const value = useProviderState();
  return <LensFilterContext value={value}>{children}</LensFilterContext>;
}
