import { HUBS_SCALE, OVERVIEW_SCALE } from "./constants.js";
import type { GraphZoomBucket } from "./types.js";

/**
 * Classify an on-screen scale (screen pixels per world unit) into the zoom
 * bucket that decides which text a drawing shows: 14px text needs at least
 * 12/14 to reach 12px on screen, 16px text at least 12/16.
 *
 * @param scale - The world's on-screen scale.
 * @returns `overview` below 0.75, `hubs` below 12/14, `full` from 12/14.
 */
export default function classifyZoomBucket(scale: number): GraphZoomBucket {
  if (scale < OVERVIEW_SCALE) return "overview";
  if (scale < HUBS_SCALE) return "hubs";
  return "full";
}
