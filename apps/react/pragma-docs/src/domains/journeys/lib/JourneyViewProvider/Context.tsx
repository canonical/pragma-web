import { createContext } from "react";
import { DEFAULT_JOURNEY_VIEW } from "../../constants.js";
import type { JourneyViewValue } from "./types.js";

/**
 * The reading the journeys canvas shows and the graph's filter, shared by
 * the strip's switch, the explorer in the canvas and the layout's
 * inspector, which counts what the graph draws.
 *
 * The mode strip and the inspector are rendered by the lens's own layout as
 * siblings of the routed page, not descendants, so no prop path runs from
 * the explorer across to the switch. Context crosses that boundary and is
 * the smallest bridge that does.
 *
 * Its default is the table and no filter with inert setters, so a consumer
 * outside any provider degrades to the table and the default filter rather
 * than throwing.
 */
const JourneyViewContext = createContext<JourneyViewValue>({
  view: DEFAULT_JOURNEY_VIEW,
  setView: () => {},
  filter: undefined,
  setFilter: () => {},
});

export default JourneyViewContext;
