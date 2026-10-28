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
