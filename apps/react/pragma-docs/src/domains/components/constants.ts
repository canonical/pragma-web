import type { LensRenderers } from "@canonical/prism-core";

/**
 * The renderers the lens's pages offer over the site's defaults: the
 * catalog as a table, the default, or as cards, and a component's page as
 * the page or its Turtle.
 */
export const COMPONENTS_RENDERERS: LensRenderers = {
  list: ["table", "cards"],
  page: ["page", "turtle"],
};

/** The tier the catalog lists first. */
export const GLOBAL_TIER = "Global";

/**
 * The relations a component's page lists, one group each, in the order the
 * page shows them: the graph's connection field of each.
 */
export const RELATION_FIELDS = [
  "inheritsFroms",
  "specializedBies",
  "variants",
  "variantOfs",
  "subcomponents",
  "modifierFamilies",
] as const;
