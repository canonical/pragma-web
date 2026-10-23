import {
  defaultProjectionMaps,
  type ProjectionMaps,
} from "@canonical/prism-projections";
import { SiteCardSlot } from "./lib/SiteCardSlot/index.js";
import { SiteChipSlot } from "./lib/SiteChipSlot/index.js";
import { SiteCommandSlot } from "./lib/SiteCommandSlot/index.js";
import { SiteGraphNodeSlot } from "./lib/SiteGraphNodeSlot/index.js";
import { SiteRowSlot } from "./lib/SiteRowSlot/index.js";
import type { HomeLensMessages } from "./types.js";

/**
 * How many columns of the page's subgrid each door spans: two, the width of
 * the Figma projection matrix's card.
 */
export const HOME_CARD_SPAN = 2;

/**
 * Each door's words, by its lens's index route name: the catalog keys of
 * its counted noun and of its summary line. The keys' order is the rail's.
 */
export const HOME_LENS_MESSAGES = {
  stations: { count: "home.stations.count", summary: "home.stations.summary" },
  lines: { count: "home.lines.count", summary: "home.lines.summary" },
  definitions: {
    count: "home.definitions.count",
    summary: "home.definitions.summary",
  },
} as const satisfies Readonly<Record<string, HomeLensMessages>>;

/**
 * The site's projection maps: the default maps for every form, with the
 * metro types armed under `siteTypes`. Each form's site dispatcher reads
 * the package's site slot, the app's own compile of
 * `Site<Form>Slot_node`, and renders the station's, the
 * interchange's, the line's or the fare zone's projection; every other
 * type keeps the package's arms.
 */
export const metroProjectionMaps: ProjectionMaps = {
  chip: {
    ...defaultProjectionMaps.chip,
    siteTypes: {
      Station: SiteChipSlot,
      Interchange: SiteChipSlot,
      Line: SiteChipSlot,
      Zone: SiteChipSlot,
    },
  },
  row: {
    ...defaultProjectionMaps.row,
    siteTypes: {
      Station: SiteRowSlot,
      Interchange: SiteRowSlot,
      Line: SiteRowSlot,
      Zone: SiteRowSlot,
    },
  },
  card: {
    ...defaultProjectionMaps.card,
    siteTypes: {
      Station: SiteCardSlot,
      Interchange: SiteCardSlot,
      Line: SiteCardSlot,
      Zone: SiteCardSlot,
    },
  },
  command: {
    ...defaultProjectionMaps.command,
    siteTypes: {
      Station: SiteCommandSlot,
      Interchange: SiteCommandSlot,
      Line: SiteCommandSlot,
      Zone: SiteCommandSlot,
    },
  },
  graphNode: {
    ...defaultProjectionMaps.graphNode,
    siteTypes: {
      Station: SiteGraphNodeSlot,
      Interchange: SiteGraphNodeSlot,
      Line: SiteGraphNodeSlot,
      Zone: SiteGraphNodeSlot,
    },
  },
};
