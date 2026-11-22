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

/**
 * The value fields the catalog's list leaves out: all of them, as none
 * fits a column (the tier heads its section, the relations and the stage
 * are connections no value reads, the rest long text or mostly empty), so
 * the catalog keeps its two-line rows, each a component's summary and its
 * documentation's stage.
 */
export const CATALOG_LIST_OMITS: readonly string[] = [
  "tier",
  "inheritsFroms",
  "specializedBies",
  "variants",
  "variantOfs",
  "subcomponents",
  "modifierFamilies",
  "documentationStages",
  "version",
  "figmaLink",
  "usage",
  "guidelines",
  "anatomyClassic",
  "anatomyDsl",
  "properties",
  "tokenBindings",
  "changeLogs",
  "decisionLog",
];

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
