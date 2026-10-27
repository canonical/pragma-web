import type { EntityListView } from "@canonical/prism-projections";
import { MESSAGES } from "#i18n";
import type { FleetNodeKind } from "./types.js";

/**
 * The fleet lens in the rail: its label and its place, fifth. Stations,
 * lines and Definitions hold the first three places and the network lens
 * the fourth, and the rail needs every place distinct.
 */
export const FLEET_LENS = { label: MESSAGES["lens.fleet"], order: 5 };

/**
 * The fleet lens's route names, each the page of one kind of fleet node,
 * and the index's. The layout reads them to pick the facts of the page in
 * its aside.
 */
export const FLEET_ROUTES = {
  index: "fleet",
  stock: "fleetStock",
  formation: "fleetFormation",
  unit: "fleetUnit",
  carType: "fleetCarType",
} as const;

/** The kind of fleet node each page route shows, by route name. */
export const KIND_BY_ROUTE: Readonly<Record<string, FleetNodeKind>> = {
  [FLEET_ROUTES.stock]: "stock",
  [FLEET_ROUTES.formation]: "formation",
  [FLEET_ROUTES.unit]: "unit",
  [FLEET_ROUTES.carType]: "carType",
};

/**
 * The GraphQL type each kind of page shows. A page's operation answers an
 * address naming a node of another type with that node's type name and none
 * of the page's fields, so a reader checks the type against this first.
 */
export const TYPENAME_BY_KIND: Readonly<Record<FleetNodeKind, string>> = {
  stock: "RollingStock",
  formation: "Formation",
  unit: "Unit",
  carType: "CarType",
};

/** The class whose instances the fleet index lists, compact. */
export const FLEET_CLASS_URI = "metro:RollingStock";

/**
 * How many rolling stocks the index asks for in one page. The fleet is
 * small; the index shows it whole.
 */
export const FLEET_PAGE_SIZE = 50;

/** The two ways the index shows the fleet. */
export const FLEET_VIEWS: readonly EntityListView[] = ["cards", "rows"];

/**
 * The search parameter the index keeps its view in, so a view survives a
 * reload and travels with a shared link: `/fleet?view=rows`.
 */
export const FLEET_VIEW_PARAM = "view";

/**
 * The view the index shows when the address names none, or names one it
 * does not know: cards, whose sidecars draw each stock's formations. The
 * address carries the parameter only for the other view.
 */
export const DEFAULT_FLEET_VIEW: EntityListView = "cards";

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

/** How far a platform mark drops below the cars, to hold the overhang. */
export const MARK_DROP = 1200;
