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

/** The metro namespace every network IRI below sits in. */
export const METRO_NAMESPACE = "https://metro.example/onto#";

/**
 * The routed stations as the graph places them on its schematic grid: local
 * name, title, grid position, and whether the graph serves it as an
 * interchange. The two bare stations have no position and are not here.
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
