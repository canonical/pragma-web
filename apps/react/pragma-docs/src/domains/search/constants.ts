import { STANDARDS_BINDING } from "#domains/standards";

/** How many results one search page asks the provider for. */
export const SEARCH_PAGE_SIZE = 20;

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
