import { DEFAULT_JOURNEY_VIEW, JOURNEY_VIEWS } from "./constants.js";
import type { JourneyView } from "./types.js";

/**
 * Read the journeys view from the value of its search parameter: one of
 * the two views by name, and the table for anything else, an absent
 * parameter included, so a mistyped or stale address still shows the lens.
 *
 * @param value - The parameter's value, or `null` when the address has none.
 * @returns The view the canvas shows.
 */
export default function readJourneyView(value: unknown): JourneyView {
  return JOURNEY_VIEWS.find((view) => view === value) ?? DEFAULT_JOURNEY_VIEW;
}
