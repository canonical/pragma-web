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

/**
 * How long a lens page test may take: it mounts the whole provider stack
 * over a real socket, and the Definitions page lays its graph out, which
 * overruns the default under parallel machine load.
 */
export const LENS_PAGE_TEST_TIMEOUT_MS = 15_000;

/** How long a lens page test waits for the page to answer. */
export const LENS_PAGE_WAIT_MS = 10_000;
