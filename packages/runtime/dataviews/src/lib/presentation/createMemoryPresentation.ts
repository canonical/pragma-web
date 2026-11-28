import createPresentation from "./createPresentation.js";
import type { Presentation } from "./types.js";

/**
 * A presentation kept in memory alone, saved nowhere and linked nowhere,
 * for a part that keeps its own arrangement for the mount.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function createMemoryPresentation(): Presentation {
  return createPresentation();
}
