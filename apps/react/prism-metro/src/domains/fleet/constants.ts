import type { LensRenderers } from "@canonical/prism-core";
import { LOCALE, MESSAGES } from "#i18n";

/**
 * The fleet lens in the rail: its label and its place, fifth. Stations,
 * lines and Definitions hold the first three places, the fourth is kept
 * for a lens of the network, and the rail needs every place distinct.
 */
export const FLEET_LENS = { label: MESSAGES["lens.fleet"], order: 5 };

/**
 * The fleet lens's route names, each the page of one kind of fleet node,
 * and the index's. The layout reads the index's to give it the count.
 */
export const FLEET_ROUTES = {
  index: "fleet",
  stock: "fleetStock",
  formation: "fleetFormation",
  unit: "fleetUnit",
  carType: "fleetCarType",
} as const;

/**
 * The sections of the fleet's pages, by what they hold: each id is its
 * heading's and its index link's fragment, one per page.
 */
export const FLEET_SECTIONS = {
  formations: "formations",
  carTypes: "car-types",
  sideView: "side-view",
  units: "units",
  platformFit: "platform-fit",
} as const;

/** The class whose instances the fleet index lists, compact. */
export const FLEET_CLASS_URI = "metro:RollingStock";

/**
 * How many rolling stocks the index asks for in one page. The fleet is
 * small; the index shows it whole.
 */
export const FLEET_PAGE_SIZE = 50;

/** Metres to at most one decimal, in the app's locale: "120 m". */
export const LENGTH_FORMAT = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "meter",
  maximumFractionDigits: 1,
});

/** Whole counts, in the app's locale. */
export const COUNT_FORMAT = new Intl.NumberFormat(LOCALE);

/**
 * The renderers the fleet's pages offer over the site's defaults: the index
 * as a table, the default, or as cards, whose specimens draw each stock's
 * formations; a node's page as the page, the default, or as its Turtle
 * source while the site's provider serves `source`.
 */
export const FLEET_RENDERERS: LensRenderers = {
  list: ["table", "cards"],
  page: ["page", "turtle"],
};

// The side view's drawing constants, in the drawing's own space: whole
// millimetres along and across the train, the unit the graph measures cars
// in, so a car's drawn length is its length.

/** The height every car body is drawn at. */
export const CAR_HEIGHT = 3600;

/** How far a cab's slanted nose runs along the car from its end. */
export const CAB_NOSE = 2000;

/** The gap drawn where two units couple, taken from both units' ends. */
export const COUPLING_GAP = 1000;

/** The gap drawn between two cars of one unit, taken from both cars. */
export const GANGWAY_GAP = 300;

/**
 * The length a car or a unit drawn on its own page is drawn against: a
 * long metro train, so a 20 m car takes a sixth of the column, not all of
 * it, and reads at about the scale the fleet's trains do.
 */
export const REFERENCE_TRAIN_LENGTH = 120000;

/** How far a platform mark drops below the cars, to hold the overhang. */
export const MARK_DROP = 1200;
