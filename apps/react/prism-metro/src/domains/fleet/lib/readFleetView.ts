import type { EntityListView } from "@canonical/prism-projections";
import { DEFAULT_FLEET_VIEW, FLEET_VIEWS } from "../constants.js";

/**
 * Read the index's view from the value of its search parameter: one of the
 * two views by name, and the default view for anything else, an absent
 * parameter included, so a mistyped or stale address still shows the fleet.
 *
 * @param value - The parameter's value, or `null` when the address has none.
 * @returns The view the index shows.
 */
export default function readFleetView(value: unknown): EntityListView {
  return FLEET_VIEWS.find((view) => view === value) ?? DEFAULT_FLEET_VIEW;
}
