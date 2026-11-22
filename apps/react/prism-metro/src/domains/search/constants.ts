import { FLEET_CLASS_URI } from "#domains/fleet";
import { LINES_BINDING, STATIONS_BINDING } from "#domains/lenses";

/** The fixed id of the search page's title, which names its section. */
export const SEARCH_TITLE_ID = "search-page-title";

/**
 * The class each lens lists, keyed by the lens's route name: the empty
 * page's door for that lens shows the class's total. A lens that lists no
 * single class (the network's map, the Definitions) has no entry, and its
 * door shows no total. The keys name the doors query's variables too.
 */
export const SEARCH_DOOR_CLASSES = {
  stations: STATIONS_BINDING.classUri,
  lines: LINES_BINDING.classUri,
  fleet: FLEET_CLASS_URI,
} as const satisfies Readonly<Record<string, string>>;

/**
 * The site's prominent class: the one its first lens lists, the Stations.
 * Its group leads a search's results when it has any; the other types
 * follow by ascending count.
 */
export const SEARCH_PROMINENT_CLASS = "https://metro.example/onto#Station";
