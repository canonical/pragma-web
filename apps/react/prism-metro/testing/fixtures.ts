import type {
  FormationUnit,
  PlatformLine,
  UnitCar,
} from "../src/domains/fleet/types.js";

/**
 * The metro nodes the app's tests address, and the counts the graph's
 * dataset gives them. Every suite speaks about the same nodes, so a change
 * to an exemplar is made once.
 */

/** The stations exemplar: Northgate, by its compact address. */
export const NORTHGATE_CURIE = "metro:northgate";

/** Northgate's title, as the graph names it. */
export const NORTHGATE_TITLE = "Northgate";

/** An interchange, the station subclass the graph serves as its own type. */
export const CENTRAL_EXCHANGE_CURIE = "metro:central-exchange";

/** Central Exchange's title, as the graph names it. */
export const CENTRAL_EXCHANGE_TITLE = "Central Exchange";

/** The lines exemplar: the Circle Line, by its compact address. */
export const CIRCLE_LINE_CURIE = "metro:circle-line";

/** The Circle Line's title, as the graph names it. */
export const CIRCLE_LINE_TITLE = "Circle Line";

/** The definitions exemplar: the station class, by its compact address. */
export const STATION_CLASS_CURIE = "metro:Station";

/** The fare zone class, whose instances have no home on this site. */
export const ZONE_CLASS_CURIE = "geo:Zone";

/** A fare zone's title, as the graph names it. */
export const ZONE_TITLE = "Central Zone";

/**
 * How many instances `metro:Station` has: 23 stations, two of them bare, and
 * 4 interchanges.
 */
export const STATION_COUNT = 27;

/** How many of the stations are interchanges. */
export const INTERCHANGE_COUNT = 4;

/** How many lines the network runs: seven lines. */
export const LINE_COUNT = 7;

// The fleet, as the graph's dataset gives it: each car type's measures, the
// units they form and the formations those units run in. The formations
// are written front first, as `Formation.units` lists them.

/** The Series 90 driving motor car: 20 m, with a cab. */
export const SERIES_90_DRIVING: UnitCar = {
  code: "DM",
  title: "Series 90 driving motor car",
  length: 20000,
  hasCab: true,
  reversed: false,
};

/** The Series 90 trailer car: 20 m, no cab. */
export const SERIES_90_TRAILER: UnitCar = {
  code: "T",
  title: "Series 90 trailer car",
  length: 20000,
  hasCab: false,
  reversed: false,
};

/** The Series 70 driving motor car: 18.4 m, with a cab. */
export const SERIES_70_DRIVING: UnitCar = {
  code: "DM",
  title: "Series 70 driving motor car",
  length: 18400,
  hasCab: true,
  reversed: false,
};

/** The Series 70 motor car: 17.6 m, no cab. */
export const SERIES_70_MOTOR: UnitCar = {
  code: "M",
  title: "Series 70 motor car",
  length: 17600,
  hasCab: false,
  reversed: false,
};

/** The Series 70 trailer car: 17.6 m, no cab. */
export const SERIES_70_TRAILER: UnitCar = {
  code: "T",
  title: "Series 70 trailer car",
  length: 17600,
  hasCab: false,
  reversed: false,
};

/** The Series 50 driving motor car: 16 m, with a cab. */
export const SERIES_50_DRIVING: UnitCar = {
  code: "DM",
  title: "Series 50 driving motor car",
  length: 16000,
  hasCab: true,
  reversed: false,
};

/** The Series 50 trailer car: 15 m, no cab. */
export const SERIES_50_TRAILER: UnitCar = {
  code: "T",
  title: "Series 50 trailer car",
  length: 15000,
  hasCab: false,
  reversed: false,
};

/** The Series 90 unit: a cab at each end, the rear driving car reversed. */
export const SERIES_90_UNIT: FormationUnit = {
  reversed: false,
  cars: [
    SERIES_90_DRIVING,
    SERIES_90_TRAILER,
    { ...SERIES_90_DRIVING, reversed: true },
  ],
};

/** The Series 50 unit: asymmetric, one cab, at its front. */
export const SERIES_50_UNIT: FormationUnit = {
  reversed: false,
  cars: [SERIES_50_DRIVING, SERIES_50_TRAILER],
};

/** The Series 70 fixed formation: one six-car unit, 107.2 m. */
export const SERIES_70_FIXED: readonly FormationUnit[] = [
  {
    reversed: false,
    cars: [
      SERIES_70_DRIVING,
      SERIES_70_MOTOR,
      SERIES_70_TRAILER,
      SERIES_70_TRAILER,
      SERIES_70_MOTOR,
      { ...SERIES_70_DRIVING, reversed: true },
    ],
  },
];

/** The Series 90 three-car: one unit run alone, 60 m. */
export const SERIES_90_THREE_CAR: readonly FormationUnit[] = [SERIES_90_UNIT];

/** The Series 90 six-car: two units coupled, 120 m. */
export const SERIES_90_SIX_CAR: readonly FormationUnit[] = [
  SERIES_90_UNIT,
  SERIES_90_UNIT,
];

/** The Series 50 four-car: two one-cab units back to back, 62 m. */
export const SERIES_50_FOUR_CAR: readonly FormationUnit[] = [
  SERIES_50_UNIT,
  { ...SERIES_50_UNIT, reversed: true },
];

/**
 * The North Line's stops and their shortest platforms, as the graph gives
 * them. Marsh End's 100 m is the shortest, so the 120 m six-car overhangs
 * it by 20 m and fits everywhere else.
 */
export const NORTH_LINE_PLATFORMS: PlatformLine = {
  title: "North Line",
  code: "1",
  stops: [
    { title: "Northgate", platformLength: 125000 },
    { title: "Verge Park", platformLength: 125000 },
    { title: "Foundry Row", platformLength: 125000 },
    { title: "Central Exchange", platformLength: 160000 },
    { title: "Marsh End", platformLength: 100000 },
  ],
};

/**
 * A line made up for the tests, whose stops' platforms are not all known:
 * two stops of 70 m and one the graph gives no length for.
 */
export const PARTLY_MEASURED_LINE: PlatformLine = {
  title: "Test Line",
  code: "T",
  stops: [
    { title: "Alpha", platformLength: 70000 },
    { title: "Beta", platformLength: null },
    { title: "Gamma", platformLength: 70000 },
  ],
};

/** A line made up for the tests, with no stop whose platform is known. */
export const UNMEASURED_LINE: PlatformLine = {
  title: "Unmeasured Line",
  code: "U",
  stops: [{ title: "Delta", platformLength: null }],
};

/** The Series 90 rolling stock, by its compact address. */
export const SERIES_90_CURIE = "metro:series-90";

/** The Series 90 six-car formation, by its compact address. */
export const SERIES_90_SIX_CAR_CURIE = "metro:series-90-six-car";

/** The Series 90 six-car formation's IRI, the form `node(id:)` takes. */
export const SERIES_90_SIX_CAR_IRI =
  "https://metro.example/onto#series-90-six-car";

/** The Series 50 four-car formation's IRI. */
export const SERIES_50_FOUR_CAR_IRI =
  "https://metro.example/onto#series-50-four-car";

/** The Series 90 unit's IRI. */
export const SERIES_90_UNIT_IRI = "https://metro.example/onto#unit-90";

/** The Series 90 unit, by its compact address. */
export const SERIES_90_UNIT_CURIE = "metro:unit-90";

/** The Series 90 driving motor car type, by its compact address. */
export const SERIES_90_DRIVING_CURIE = "metro:car-90-driving";

/** How many rolling stocks the graph's fleet has. */
export const ROLLING_STOCK_COUNT = 3;
