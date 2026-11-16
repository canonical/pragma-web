import type { Translate } from "#i18n";
import { COUNT_FORMAT, LENGTH_FORMAT } from "../constants.js";
import type { StockFact } from "../types.js";
import describeRange from "./describeRange.js";

/**
 * Build the facts a rolling stock's card lists, in their order, each naming
 * the graph property it reads: how many formations it runs in, then the
 * range of their lengths and of their capacities. A stock with no
 * formation has no measures, so it has its count alone.
 *
 * @param formations - The stock's formations, each with its length in
 *   millimetres and its capacity in passengers.
 * @param t - The translator the labels and the values' words are read
 *   through.
 * @returns The facts, the count first.
 */
export default function buildStockFacts(
  formations: readonly { readonly length: number; readonly capacity: number }[],
  t: Translate,
): StockFact[] {
  const count: StockFact = {
    property: "formations",
    label: t("fleet.fact.formations"),
    value: COUNT_FORMAT.format(formations.length),
  };
  if (formations.length === 0) return [count];
  const capacities = formations.map(({ capacity }) => capacity);
  const least = Math.min(...capacities);
  return [
    count,
    {
      property: "length",
      label: t("fleet.fact.length"),
      value: describeRange(
        formations.map(({ length }) => length / 1000),
        LENGTH_FORMAT,
      ),
    },
    {
      property: "capacity",
      label: t("fleet.fact.capacity"),
      value:
        least === Math.max(...capacities)
          ? t("fleet.passengers.count", { count: least })
          : t("fleet.passengers.range", {
              range: describeRange(capacities, COUNT_FORMAT),
            }),
    },
  ];
}
