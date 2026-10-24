import type { EntityCardKeyValue } from "@canonical/prism-projections";
import type { Translate } from "#i18n";
import type { StopFacts } from "./types.js";

/**
 * Build the key values a stop's card lists, in their order: its platforms,
 * its fare zone, and the lines it serves joined into one value. A value the
 * graph does not assert leaves its pair out.
 *
 * @param stop - What the card read of the stop.
 * @param t - The translator the keys and the separator are read through.
 * @returns The pairs, one per asserted value.
 */
export default function buildStopKeyValues(
  stop: StopFacts,
  t: Translate,
): EntityCardKeyValue[] {
  const platforms = stop.platformCount ?? undefined;
  const zone = stop.inZone?._meta.title;
  const lines = stop.servesLine.map((line) => line._meta.title);
  return [
    ...(platforms === undefined
      ? []
      : [{ key: t("station.platforms"), value: platforms }]),
    ...(zone === undefined ? [] : [{ key: t("station.zone"), value: zone }]),
    ...(lines.length === 0
      ? []
      : [
          {
            key: t("station.lines"),
            value: lines.join(t("station.lines.separator")),
          },
        ]),
  ];
}
