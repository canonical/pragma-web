import type { RELATION_FIELDS } from "./constants.js";

/** A relation a component's page lists: the graph's connection field. */
export type RelationField = (typeof RELATION_FIELDS)[number];
