import type { StandardSchemaV1 } from "@canonical/router-core";
import type { CATALOG_VIEWS, RELATION_FIELDS } from "./constants.js";

/** How the catalog shows its components: as cards or as rows. */
export type CatalogView = (typeof CATALOG_VIEWS)[number];

/** A relation a component's page lists: the graph's connection field. */
export type RelationField = (typeof RELATION_FIELDS)[number];

/** The catalog route's search: the view, read from the address. */
export type CatalogSearchSchema = StandardSchemaV1<
  unknown,
  { readonly view: CatalogView }
>;
