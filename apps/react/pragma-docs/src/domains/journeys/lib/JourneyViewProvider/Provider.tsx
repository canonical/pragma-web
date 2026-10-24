import type { ReactElement } from "react";
import JourneyViewContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { JourneyViewProviderProps } from "./types.js";

/**
 * Provides the reading the journeys canvas shows, and the graph's filter,
 * to the strip's switch, the explorer and the inspector. `JourneysLayout`
 * puts it around all three. The view is read from the address, so it
 * survives the router remounting the layout on a move from the lens index
 * to a job; the filter lives as long as the layout, and a choice holds
 * only on the job it was made on.
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
