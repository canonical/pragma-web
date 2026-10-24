import type { ReactElement } from "react";
import JourneyViewContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { JourneyViewProviderProps } from "./types.js";

/**
 * Provides the reading the journeys canvas shows to the strip's switch, the
 * explorer and the inspector. `JourneysLayout` puts it around all three,
 * and it lives as long as the layout, which the router remounts whenever
 * the matched route changes: the view survives a move from one job to
 * another (the same route, new params) and starts from the table on a move
 * to the lens index or to another lens.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { JourneyViewProvider } from "../JourneyViewProvider/index.js";`
 */
export default function JourneyViewProvider({
  children,
}: JourneyViewProviderProps): ReactElement {
  const value = useProviderState();
  return <JourneyViewContext value={value}>{children}</JourneyViewContext>;
}
