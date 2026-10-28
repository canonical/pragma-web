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
 * the graph's dataset holds: red, five stops, run end to end from
 * Northgate to Marsh End and back.
 */
export const MOCK_LINE = {
  __typename: "Line",
  colour: "#c8102e",
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
 * the graph's dataset holds: yellow, six stops on a loop, run both ways,
 * and no definition.
 */
export const MOCK_LOOP_LINE = {
  __typename: "Line",
  colour: "#f2b705",
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
