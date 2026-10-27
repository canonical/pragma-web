import { DEFAULT_JOURNEY_VIEW, JOURNEY_VIEW_PARAM } from "./constants.js";
import type { JourneyView } from "./types.js";

/**
 * Build the search a link within the lens carries so the view survives the
 * move: the view's parameter for the graph, nothing for the table, which an
 * address without the parameter already shows.
 *
 * @param view - The view the reader is in.
 * @returns The link's search, or undefined for the default view.
 */
export default function buildViewSearch(
  view: JourneyView,
): Readonly<Record<typeof JOURNEY_VIEW_PARAM, JourneyView>> | undefined {
  return view === DEFAULT_JOURNEY_VIEW
    ? undefined
    : { [JOURNEY_VIEW_PARAM]: view };
}
