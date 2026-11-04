/**
 * The renderers' domain constants: the address's view grammar, the filter
 * placements a lens chooses between, the kinds of view that carry
 * renderers, and the names and labels of core's page renderers.
 */

import type { MessageKey } from "../i18n/index.js";
import type { FilterPlacement } from "./types.js";

/**
 * The search parameters a view keeps its state in, by role: the renderer
 * (`as`; `view` is left to saved views), the search text, the open sheet,
 * the graph's kind, its selection and its expanded relation.
 */
export const VIEW_PARAMS = {
  renderer: "as",
  query: "q",
  sheet: "sheet",
  graph: "graph",
  select: "select",
  expand: "expand",
} as const;

/** The `sheet` value that opens the folded filters below two groups. */
export const FILTER_SHEET = "filter";

/** Where a lens places its facets: a bar under the strip, or a side panel. */
export const FILTER_PLACEMENTS = ["bar", "panel"] as const;

/** The placement a lens takes when it declares none. */
export const DEFAULT_FILTER_PLACEMENT: FilterPlacement = "bar";

/** The kinds of view that carry renderers: an index, and one entity's page. */
export const RENDERER_KINDS = ["list", "page"] as const;

/** The names of core's page renderers: the page itself, and its Turtle. */
export const PAGE_RENDERER_NAMES = {
  page: "page",
  turtle: "turtle",
} as const;

/** The catalog key that labels each of core's page renderers. */
export const RENDERER_LABEL_KEYS: Readonly<
  Record<keyof typeof PAGE_RENDERER_NAMES, MessageKey>
> = {
  page: "renderer.page",
  turtle: "renderer.turtle",
};
