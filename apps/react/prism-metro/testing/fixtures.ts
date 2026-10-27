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
 * How many instances `metro:Station` has: 22 stations, one of them bare, and
 * 4 interchanges.
 */
export const STATION_COUNT = 26;

/** How many of the stations are interchanges. */
export const INTERCHANGE_COUNT = 4;

/** How many of the stations are not interchanges. */
export const PLAIN_STATION_COUNT = STATION_COUNT - INTERCHANGE_COUNT;

/** How many lines the network runs: seven lines. */
export const LINE_COUNT = 7;

/**
 * How long a lens page test may take: it mounts the whole provider stack
 * over a real socket, and the Definitions page lays its graph out, which
 * overruns the default under parallel machine load.
 */
export const LENS_PAGE_TEST_TIMEOUT_MS = 15_000;

/** How long a lens page test waits for the page to answer. */
export const LENS_PAGE_WAIT_MS = 10_000;

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

/** The metro namespace every network IRI below sits in. */
export const METRO_NAMESPACE = "https://metro.example/onto#";

/**
 * The routed stations as the graph places them on its schematic grid: local
 * name, title, grid position, and whether the graph serves it as an
 * interchange. The bare station has no position and is not here.
 */
export const NETWORK_STATIONS = [
  ["northgate", "Northgate", 0, 0, false],
  ["verge-park", "Verge Park", 0, 3, false],
  ["foundry-row", "Foundry Row", 0, 6, false],
  ["central-exchange", "Central Exchange", 0, 9, true],
  ["marsh-end", "Marsh End", 0, 12, false],
  ["kilnwood", "Kilnwood", 4, 5, false],
  ["quarry-hill", "Quarry Hill", 10, 5, false],
  ["tannery-lane", "Tannery Lane", 14, 9, true],
  ["willowbank", "Willowbank", 10, 13, false],
  ["riverside-junction", "Riverside Junction", 4, 13, true],
  ["harbourside", "Harbourside", 9, 18, false],
  ["saltford", "Saltford", 13, 18, false],
  ["greenhithe", "Greenhithe", 17, 18, false],
  ["eastcliff", "Eastcliff", 21, 18, false],
  ["larkrise", "Larkrise", 18, 5, false],
  ["highmoor", "Highmoor", 24, 5, false],
  ["eastwick-cross", "Eastwick Cross", 28, 9, true],
  ["millford", "Millford", 18, 13, false],
  ["reedmere", "Reedmere", 24, 13, false],
  ["dyers-green", "Dyers Green", 11, 22, false],
  ["fernside", "Fernside", 19, 22, false],
  ["nettlebed", "Nettlebed", 23, 26, false],
  ["orchard-gate", "Orchard Gate", 19, 30, false],
  ["pinfold", "Pinfold", 11, 30, false],
  ["ropewalk", "Ropewalk", 7, 26, false],
] as const;

/**
 * The network's lines as the graph serves them: local name, code, colour,
 * title, and each route as its label, whether it loops, the label of its
 * reverse, and its calls by local name, in order.
 */
export const NETWORK_LINES = [
  [
    "north-line",
    "1",
    "#c8102e",
    "North Line",
    [
      [
        "To Marsh End",
        false,
        "To Northgate",
        [
          "northgate",
          "verge-park",
          "foundry-row",
          "central-exchange",
          "marsh-end",
        ],
      ],
      [
        "To Northgate",
        false,
        "To Marsh End",
        [
          "marsh-end",
          "central-exchange",
          "foundry-row",
          "verge-park",
          "northgate",
        ],
      ],
    ],
  ],
  [
    "circle-line",
    "2",
    "#f2b705",
    "Circle Line",
    [
      [
        "Clockwise",
        true,
        "Anticlockwise",
        [
          "central-exchange",
          "kilnwood",
          "quarry-hill",
          "tannery-lane",
          "willowbank",
          "riverside-junction",
        ],
      ],
      [
        "Anticlockwise",
        true,
        "Clockwise",
        [
          "central-exchange",
          "riverside-junction",
          "willowbank",
          "tannery-lane",
          "quarry-hill",
          "kilnwood",
        ],
      ],
    ],
  ],
  [
    "coastal-line",
    "3",
    "#0072ce",
    "Coastal Line",
    [
      [
        "To Eastcliff",
        false,
        "To Central Exchange",
        [
          "central-exchange",
          "riverside-junction",
          "harbourside",
          "saltford",
          "greenhithe",
          "eastcliff",
        ],
      ],
      [
        "To Central Exchange",
        false,
        "To Eastcliff",
        [
          "eastcliff",
          "greenhithe",
          "saltford",
          "harbourside",
          "riverside-junction",
          "central-exchange",
        ],
      ],
    ],
  ],
  [
    "upland-line",
    "4",
    "#00843d",
    "Upland Line",
    [
      [
        "To Eastwick Cross",
        false,
        "To Tannery Lane",
        ["tannery-lane", "larkrise", "highmoor", "eastwick-cross"],
      ],
      [
        "To Tannery Lane",
        false,
        "To Eastwick Cross",
        ["eastwick-cross", "highmoor", "larkrise", "tannery-lane"],
      ],
    ],
  ],
  [
    "lowland-line",
    "5",
    "#8e3ba3",
    "Lowland Line",
    [
      [
        "To Eastwick Cross",
        false,
        "To Tannery Lane",
        ["tannery-lane", "millford", "reedmere", "eastwick-cross"],
      ],
      [
        "To Tannery Lane",
        false,
        "To Eastwick Cross",
        ["eastwick-cross", "reedmere", "millford", "tannery-lane"],
      ],
    ],
  ],
  [
    "ringway-clockwise",
    "R1",
    "#c46a2b",
    "Ringway Clockwise",
    [
      [
        "Clockwise",
        true,
        null,
        [
          "dyers-green",
          "fernside",
          "nettlebed",
          "orchard-gate",
          "pinfold",
          "ropewalk",
        ],
      ],
    ],
  ],
  [
    "ringway-anticlockwise",
    "R2",
    "#7a4b2a",
    "Ringway Anticlockwise",
    [
      [
        "Anticlockwise",
        true,
        null,
        [
          "dyers-green",
          "ropewalk",
          "pinfold",
          "orchard-gate",
          "nettlebed",
          "fernside",
        ],
      ],
    ],
  ],
] as const;

/** How many stations the network's routes call at. */
export const ROUTED_STATION_COUNT = 25;

/** How many routes the network's lines run, both directions counted. */
export const ROUTE_COUNT = 12;
