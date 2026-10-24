import type { EntityListView } from "@canonical/prism-projections";

/** The search parameter the catalog keeps its view in. */
export const CATALOG_VIEW_PARAM = "view";

/** The views the catalog shows its components in. */
export const CATALOG_VIEWS = [
  "cards",
  "rows",
] as const satisfies readonly EntityListView[];

/** The view the catalog shows when the address names none. */
export const DEFAULT_CATALOG_VIEW = "cards";

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
