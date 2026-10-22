import { MESSAGES } from "#i18n";

/**
 * The fleet lens in the rail: its label and its place, fifth. Stations,
 * lines and Definitions hold the first three places and the network lens
 * the fourth, and the rail needs every place distinct.
 */
export const FLEET_LENS = { label: MESSAGES["lens.fleet"], order: 5 };

/** The class whose instances the fleet index lists, compact. */
export const FLEET_CLASS_URI = "metro:RollingStock";

/**
 * How many rolling stocks the index asks for in one page. The fleet is
 * small; the index shows it whole.
 */
export const FLEET_PAGE_SIZE = 50;

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
