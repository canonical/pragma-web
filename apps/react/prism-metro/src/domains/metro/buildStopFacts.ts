import type { EntityFact } from "@canonical/prism-projections";
import type { Translate } from "#i18n";
import type { StopFacts } from "./types.js";

/**
 * Build the facts a stop's card lists, in their order, each naming the
 * graph property it reads: its platforms, its fare zone, and the lines it
 * serves joined into one value. A value the graph does not assert leaves
 * its fact out.
 *
 * @param stop - What the card read of the stop.
 * @param t - The translator the labels and the separator are read through.
 * @returns The facts, one per asserted value.
 */
export default function buildStopFacts(
  stop: StopFacts,
  t: Translate,
): EntityFact[] {
  const platforms = stop.platformCount ?? undefined;
  const zone = stop.inZone?._meta.title;
  const lines = stop.servesLine.map((line) => line._meta.title);
  return [
    ...(platforms === undefined
      ? []
      : [
          {
            property: "platformCount",
            label: t("station.platforms"),
            value: platforms,
          },
        ]),
    ...(zone === undefined
      ? []
      : [{ property: "inZone", label: t("station.zone"), value: zone }]),
    ...(lines.length === 0
      ? []
      : [
          {
            property: "servesLine",
            label: t("station.lines"),
            value: lines.join(t("station.lines.separator")),
          },
        ]),
  ];
}
