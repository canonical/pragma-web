import { createTranslator } from "@canonical/i18n-core";
import {
  compareText,
  LABEL_SIZE,
  measureTextWidth,
  orderBy,
  REGION_LABEL_GAP,
} from "@canonical/prism-core";
import { MESSAGES } from "../i18n/constants.js";
import { MEASURED_LOCALE } from "./constants.js";
import measureRegionHeading from "./measureRegionHeading.js";
import type {
  Bridge,
  LaidOutRegion,
  RegionBridgeName,
  RegionBridgeNames,
} from "./types.js";

/** The catalog a name is measured in, the same in every locale. */
const measured = createTranslator(MEASURED_LOCALE, MESSAGES);

/**
 * Name a region's bridges on its label row, after its heading: the
 * heaviest first (then by the other region's prefix), as many as fit in
 * the region's width, each a gap after the last; a region with no bridge
 * says so instead, where that fits, unless the layout is a term's
 * neighbourhood: that layout holds only the class's neighbours, so a region
 * with no bridge drawn there may still have bridges, and the row says
 * nothing. The region is never widened for them: a bridge left unnamed
 * keeps its label on the canvas.
 *
 * @param region - The region whose label row names them.
 * @param bridges - Every bridge of the layout.
 * @param opened - Whether its heading carries the way back.
 * @param focused - Whether the layout draws a term's neighbourhood.
 * @returns The bridges named, in the row's order, and whether the row says
 *   the region has none.
 */
export default function nameRegionBridges(
  region: LaidOutRegion,
  bridges: readonly Bridge[],
  opened: boolean,
  focused: boolean,
): RegionBridgeNames {
  const ends = bridges
    .filter(({ a, b }) => a === region.prefix || b === region.prefix)
    .map(({ a, b, relations }) => ({
      prefix: a === region.prefix ? b : a,
      relations,
    }))
    .sort((x, y) =>
      orderBy(y.relations - x.relations, compareText(x.prefix, y.prefix)),
    );
  let end = measureRegionHeading(region.prefix, region.members, opened);
  if (ends.length === 0) {
    if (focused) return { named: [], none: false };
    const width = measureTextWidth(
      measured("well.region.bridges.none"),
      "regular",
      LABEL_SIZE,
    );
    return { named: [], none: end + REGION_LABEL_GAP + width <= region.w };
  }
  const named: RegionBridgeName[] = [];
  for (const bridge of ends) {
    const width = measureTextWidth(
      measured("well.region.bridge", {
        prefix: bridge.prefix,
        relations: measured("well.relations.count", {
          count: bridge.relations,
        }),
      }),
      "regular",
      LABEL_SIZE,
    );
    end += REGION_LABEL_GAP + width;
    if (end > region.w) break;
    named.push(bridge);
  }
  return { named, none: false };
}
