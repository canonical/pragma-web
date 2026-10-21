/**
 * Entity bindings: which GraphQL type serves each ontology class, declared
 * once and checked against the schema and the running graph.
 *
 * @module
 */

export { assertBindings } from "./assertBindings.js";
export { assertBindingsLive } from "./assertBindingsLive.js";
export { defineBinding } from "./defineBinding.js";
export type { EntityBinding, GraphQLExecute } from "./types.js";
