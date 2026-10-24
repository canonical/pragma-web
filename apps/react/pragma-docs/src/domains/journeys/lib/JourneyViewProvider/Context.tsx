import { createContext } from "react";
import { DEFAULT_JOURNEY_VIEW } from "../../constants.js";
import type { JourneyViewValue } from "./types.js";

/**
 * The reading the journeys canvas shows, shared by the strip's switch, the
 * explorer in the canvas and the layout's inspector.
 *
 * The mode strip and the inspector are rendered by the lens's own layout as
 * siblings of the routed page, not descendants, so no prop path runs from
 * the explorer across to the switch. Context crosses that boundary and is
 * the smallest bridge that does.
 *
 * Its default is the table with an inert setter, so a consumer outside any
 * provider degrades to the table rather than throwing.
 */
const JourneyViewContext = createContext<JourneyViewValue>({
  view: DEFAULT_JOURNEY_VIEW,
  setView: () => {},
});

export default JourneyViewContext;
