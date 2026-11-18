import { createTranslator } from "@canonical/i18n-core";
import {
  LABEL_SIZE,
  measureRegionLabelWidth,
  measureTextWidth,
  REGION_LABEL_GAP,
} from "@canonical/prism-core";
import { MESSAGES } from "../i18n/constants.js";
import { MEASURED_LOCALE } from "./constants.js";

/** The catalog a heading is measured in, the same in every locale. */
const measured = createTranslator(MEASURED_LOCALE, MESSAGES);

/**
 * Measure a region's heading row: its label (prefix and class count) and,
 * on the opened namespace, the words of its way back after the count, set
 * as the catalog's English sets them, rounded up to the pixel.
 *
 * @param prefix - The region's prefix.
 * @param count - The classes it holds.
 * @param opened - Whether it is the namespace a view opened, whose heading
 *   carries the way back.
 * @returns The heading's width, in px.
 */
export default function measureRegionHeading(
  prefix: string,
  count: number,
  opened: boolean,
): number {
  const label = measureRegionLabelWidth(prefix, count);
  return opened
    ? Math.ceil(
        label +
          REGION_LABEL_GAP +
          measureTextWidth(
            measured("well.region.back.words"),
            "regular",
            LABEL_SIZE,
          ),
      )
    : label;
}
