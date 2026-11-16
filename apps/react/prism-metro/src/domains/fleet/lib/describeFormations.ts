import type { Translate } from "#i18n";
import type { FleetFact } from "../types.js";
import buildStockFacts from "./buildStockFacts.js";

/**
 * Read a rolling stock's formations as facts: how many there are, then the
 * range of their lengths and of their capacities. A stock with no
 * formation has no measures, so it reads as its count alone.
 *
 * @param formations - The stock's formations, each with its length in
 *   millimetres and its capacity in passengers.
 * @param t - The translator the facts' words are read through.
 * @returns The facts, the count first.
 */
export default function describeFormations(
  formations: readonly { readonly length: number; readonly capacity: number }[],
  t: Translate,
): readonly FleetFact[] {
  return buildStockFacts(formations, t).map(({ label, value }) => ({
    term: label,
    value,
  }));
}
