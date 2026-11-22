import type { SiteSwitches } from "@canonical/prism-projections";
import { SiteCardSlot } from "../SiteCardSlot/index.js";
import { SiteChipSlot } from "../SiteChipSlot/index.js";
import { SiteCommandSlot } from "../SiteCommandSlot/index.js";
import { SiteGraphNodeSlot } from "../SiteGraphNodeSlot/index.js";
import { SiteRowSlot } from "../SiteRowSlot/index.js";

/**
 * The `@canonical/styles` presets the shell's root carries: `grid` lays it
 * out as a grid with the gutter gaps, and `intrinsic` gives it the fluid
 * columns in groups of four.
 */
export const GRID_PRESET_CLASS_NAMES = ["grid", "intrinsic"] as const;

/**
 * The site's home namespace, as its CURIEs write it: a design-system
 * identity shows no prefix on the site's pages, and one of another
 * namespace (a `cs:` standard) shows its own (heuristic 4.3). A lens whose
 * pages are of another namespace declares its own.
 */
export const AMBIENT_NAMESPACE = "ds";

/**
 * The site's five switches as the package's switches reach them: each
 * site slot hands the node to the site's switch of its form, so a list
 * whose query spreads the package's switch renders a design-system node
 * through the site's arm.
 */
export const SITE_SWITCHES = {
  chip: SiteChipSlot,
  row: SiteRowSlot,
  card: SiteCardSlot,
  command: SiteCommandSlot,
  graphNode: SiteGraphNodeSlot,
} as const satisfies SiteSwitches;

/** How many of the pages read before the palette lists. */
export const RECENT_PAGE_LIMIT = 5;
