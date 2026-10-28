import type { GraphBox } from "@canonical/prism-core";
import { REGION_LABEL_ROW, VIEW_MARGIN } from "../../classGraph/constants.js";
import {
  measureRegionLabelWidth,
  uniteRects,
} from "../../classGraph/geometry.js";
import type { ClassGraphLayout } from "../../classGraph/types.js";

/**
 * Measure the box the camera fits: a region a reader asked for, the
 * classes the filter leaves when it hides any, with the label row of each
 * region they lie in, or nothing (the whole graph) otherwise; with the view
 * margin around it.
 *
 * @param layout - The class graph's layout.
 * @param hidden - The classes the filter hides.
 * @param region - The prefix of a region to fit, if a reader asked for one.
 * @returns The box to fit, or `undefined` for the whole graph.
 */
export default function measureVisibleBox(
  layout: ClassGraphLayout,
  hidden: ReadonlySet<string>,
  region: string | undefined,
): GraphBox | undefined {
  const asked = layout.regions.find((candidate) => candidate.prefix === region);
  const shown = [...layout.nodes.values()].filter(
    (node) => !hidden.has(node.uri),
  );
  const labels = layout.regions
    .filter((region) => shown.some((node) => node.region === region.prefix))
    .map((region) => ({
      x: region.x,
      y: region.y,
      w: measureRegionLabelWidth(region.prefix, region.ids.length),
      h: REGION_LABEL_ROW,
    }));
  const rects =
    asked !== undefined
      ? [asked]
      : hidden.size === 0 || shown.length === 0
        ? []
        : [...shown, ...labels];
  if (rects.length === 0) return undefined;
  const box = uniteRects(rects);
  return {
    x: box.x - VIEW_MARGIN,
    y: box.y - VIEW_MARGIN,
    width: box.w + 2 * VIEW_MARGIN,
    height: box.h + 2 * VIEW_MARGIN,
  };
}
