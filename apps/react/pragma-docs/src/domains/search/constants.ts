import { STANDARDS_BINDING } from "#domains/standards";

/** The fixed id of the search page's title, which names its section. */
export const SEARCH_TITLE_ID = "search-page-title";

/**
 * The class each lens lists, keyed by the lens's route name: the empty
 * page's door for that lens shows the class's total. A lens that lists no
 * single class (the Home, the Guides, the Journeys, the Definitions) has no
 * entry, and its door shows no total. The keys name the doors query's
 * variables too.
 */
export const SEARCH_DOOR_CLASSES = {
  components: "ds:Component",
  standards: STANDARDS_BINDING.classUri,
} as const satisfies Readonly<Record<string, string>>;

/**
 * The site's prominent class: the one its first lens lists, the
 * Components. Its group leads a search's results when it has any; the
 * other types follow by ascending count.
 */
export const SEARCH_PROMINENT_CLASS = "https://ds.canonical.com/Component";
