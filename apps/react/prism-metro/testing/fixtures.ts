import type {
  FormationUnit,
  PlatformLine,
  UnitCar,
} from "../src/domains/fleet/types.js";

/**
 * The metro nodes the app's tests address, the counts the graph's dataset
 * gives them, and the same nodes as a Relay mock environment answers them.
 * Every suite speaks about the same nodes, so a change to an exemplar is
 * made once.
 */

import type { MockResolver } from "relay-test-utils";

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

/** How many of the stations are not interchanges. */
export const PLAIN_STATION_COUNT = STATION_COUNT - INTERCHANGE_COUNT;

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

/** A metro IRI, by its local name, as the graph's dataset writes it. */
const metroUri = (localName: string): string =>
  `https://metro.example/onto#${localName}`;

/** A call at the stop `title` names, as a route of the dataset holds it. */
const callAt = (__typename: string, title: string) => ({
  stop: { __typename, _meta: { title } },
});

/**
 * A mock resolver that answers `entity` for the operation's root field
 * only, and leaves every nested object to the values `entity` gives it: a
 * mock environment resolves every object of a type through that type's
 * resolver, so without it a station's lines would answer as the station.
 */
export const resolveRoot =
  (entity: object): MockResolver =>
  (context) =>
    context.path?.length === 1 ? entity : undefined;

/**
 * Northgate as a Relay mock environment answers a `Station`, with what the
 * graph's dataset holds: four platforms, in the Central Zone, on the North
 * Line.
 */
export const MOCK_STATION = {
  __typename: "Station",
  platformCount: 4,
  _meta: {
    title: NORTHGATE_TITLE,
    curie: NORTHGATE_CURIE,
    definition: "The northern terminus.",
    type: { _meta: { title: "Station" } },
  },
  inZone: { _meta: { title: ZONE_TITLE } },
  servesLine: [{ _meta: { title: "North Line" } }],
} as const;

/**
 * Central Exchange as a Relay mock environment answers an `Interchange`,
 * with what the graph's dataset holds: eight platforms, a four-minute
 * transfer, in the Central Zone, where three lines meet.
 */
export const MOCK_INTERCHANGE = {
  __typename: "Interchange",
  platformCount: 8,
  transferMinutes: 4,
  _meta: {
    title: CENTRAL_EXCHANGE_TITLE,
    curie: CENTRAL_EXCHANGE_CURIE,
    definition: "The busiest transfer point on the network.",
    type: { _meta: { title: "Interchange" } },
  },
  inZone: { _meta: { title: ZONE_TITLE } },
  servesLine: [
    { _meta: { title: "North Line" } },
    { _meta: { title: CIRCLE_LINE_TITLE } },
    { _meta: { title: "Coastal Line" } },
  ],
} as const;

/**
 * The North Line as a Relay mock environment answers a `Line`, with what
 * the graph's dataset holds: five stops, run end to end from Northgate to
 * Marsh End and back.
 */
export const MOCK_LINE = {
  __typename: "Line",
  _meta: {
    title: "North Line",
    curie: "metro:north-line",
    definition: "Northgate to Marsh End, via the old cutting.",
    type: { _meta: { title: "Line" } },
  },
  servedBy: [
    { __typename: "Interchange", uri: metroUri("central-exchange") },
    { __typename: "Station", uri: metroUri("foundry-row") },
    { __typename: "Station", uri: metroUri("marsh-end") },
    { __typename: "Station", uri: metroUri("northgate") },
    { __typename: "Station", uri: metroUri("verge-park") },
  ],
  routes: [
    {
      isLoop: false,
      calls: [
        callAt("Station", NORTHGATE_TITLE),
        callAt("Station", "Verge Park"),
        callAt("Station", "Foundry Row"),
        callAt("Interchange", CENTRAL_EXCHANGE_TITLE),
        callAt("Station", "Marsh End"),
      ],
    },
    {
      isLoop: false,
      calls: [
        callAt("Station", "Marsh End"),
        callAt("Interchange", CENTRAL_EXCHANGE_TITLE),
        callAt("Station", "Foundry Row"),
        callAt("Station", "Verge Park"),
        callAt("Station", NORTHGATE_TITLE),
      ],
    },
  ],
} as const;

/**
 * The Circle Line as a Relay mock environment answers a `Line`, with what
 * the graph's dataset holds: six stops on a loop, run both ways, and no
 * definition.
 */
export const MOCK_LOOP_LINE = {
  __typename: "Line",
  _meta: {
    title: CIRCLE_LINE_TITLE,
    curie: CIRCLE_LINE_CURIE,
    definition: null,
    type: { _meta: { title: "Line" } },
  },
  servedBy: [
    { __typename: "Interchange", uri: metroUri("central-exchange") },
    { __typename: "Station", uri: metroUri("kilnwood") },
    { __typename: "Station", uri: metroUri("quarry-hill") },
    { __typename: "Interchange", uri: metroUri("riverside-junction") },
    { __typename: "Interchange", uri: metroUri("tannery-lane") },
    { __typename: "Station", uri: metroUri("willowbank") },
  ],
  routes: [
    {
      isLoop: true,
      calls: [
        callAt("Interchange", CENTRAL_EXCHANGE_TITLE),
        callAt("Station", "Kilnwood"),
        callAt("Station", "Quarry Hill"),
        callAt("Interchange", "Tannery Lane"),
        callAt("Station", "Willowbank"),
        callAt("Interchange", "Riverside Junction"),
      ],
    },
    {
      isLoop: true,
      calls: [
        callAt("Interchange", CENTRAL_EXCHANGE_TITLE),
        callAt("Interchange", "Riverside Junction"),
        callAt("Station", "Willowbank"),
        callAt("Interchange", "Tannery Lane"),
        callAt("Station", "Quarry Hill"),
        callAt("Station", "Kilnwood"),
      ],
    },
  ],
} as const;

/**
 * The Central Zone as a Relay mock environment answers a `Zone`, with what
 * the graph's dataset holds: the two stops inside it, an interchange and a
 * station.
 */
export const MOCK_ZONE = {
  __typename: "Zone",
  _meta: {
    title: ZONE_TITLE,
    curie: "geo:central-zone",
    definition: "The innermost fare band.",
    type: { _meta: { title: "Fare zone" } },
  },
  stops: [
    { __typename: "Interchange", uri: metroUri("central-exchange") },
    { __typename: "Station", uri: metroUri("northgate") },
  ],
} as const;

/**
 * How long a lens page test may take: it mounts the whole provider stack
 * over a real socket, and the Definitions page lays its graph out, which
 * overruns the default under parallel machine load.
 */
export const LENS_PAGE_TEST_TIMEOUT_MS = 15_000;

/** How long a lens page test waits for the page to answer. */
export const LENS_PAGE_WAIT_MS = 10_000;
