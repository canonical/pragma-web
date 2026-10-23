import {
  defaultProjectionMaps,
  type ProjectionMaps,
} from "@canonical/prism-projections";
import { SiteCardProjection } from "./lib/SiteCardProjection/index.js";
import { SiteChipProjection } from "./lib/SiteChipProjection/index.js";
import { SiteCommandProjection } from "./lib/SiteCommandProjection/index.js";
import { SiteGraphNodeProjection } from "./lib/SiteGraphNodeProjection/index.js";
import { SiteRowProjection } from "./lib/SiteRowProjection/index.js";
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
 * `Site<Form>Projection_node`, and renders the station's, the
 * interchange's, the line's or the fare zone's projection; every other
 * type keeps the package's arms.
 */
export const metroProjectionMaps: ProjectionMaps = {
  chip: {
    ...defaultProjectionMaps.chip,
    siteTypes: {
      Station: SiteChipProjection,
      Interchange: SiteChipProjection,
      Line: SiteChipProjection,
      Zone: SiteChipProjection,
    },
  },
  row: {
    ...defaultProjectionMaps.row,
    siteTypes: {
      Station: SiteRowProjection,
      Interchange: SiteRowProjection,
      Line: SiteRowProjection,
      Zone: SiteRowProjection,
    },
  },
  card: {
    ...defaultProjectionMaps.card,
    siteTypes: {
      Station: SiteCardProjection,
      Interchange: SiteCardProjection,
      Line: SiteCardProjection,
      Zone: SiteCardProjection,
    },
  },
  command: {
    ...defaultProjectionMaps.command,
    siteTypes: {
      Station: SiteCommandProjection,
      Interchange: SiteCommandProjection,
      Line: SiteCommandProjection,
      Zone: SiteCommandProjection,
    },
  },
  graphNode: {
    ...defaultProjectionMaps.graphNode,
    siteTypes: {
      Station: SiteGraphNodeProjection,
      Interchange: SiteGraphNodeProjection,
      Line: SiteGraphNodeProjection,
      Zone: SiteGraphNodeProjection,
    },
  },
};
