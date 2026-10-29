import type { Translate } from "#i18n";
import { COUNT_FORMAT, LENGTH_FORMAT } from "../constants.js";
import type { FleetFact } from "../types.js";
import describeRange from "./describeRange.js";

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
  const count: FleetFact = {
    term: t("fleet.fact.formations"),
    value: COUNT_FORMAT.format(formations.length),
  };
  if (formations.length === 0) return [count];
  const capacities = formations.map(({ capacity }) => capacity);
  const least = Math.min(...capacities);
  return [
    count,
    {
      term: t("fleet.fact.length"),
      value: describeRange(
        formations.map(({ length }) => length / 1000),
        LENGTH_FORMAT,
      ),
    },
    {
      term: t("fleet.fact.capacity"),
      value:
        least === Math.max(...capacities)
          ? t("fleet.passengers.count", { count: least })
          : t("fleet.passengers.range", {
              range: describeRange(capacities, COUNT_FORMAT),
            }),
    },
  ];
}
