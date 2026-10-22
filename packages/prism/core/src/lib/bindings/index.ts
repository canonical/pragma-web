/**
 * Entity bindings: which GraphQL type serves each ontology class, declared
 * once and checked against the schema and the running graph.
 *
 * @module
 */

export { default as assertBindings } from "./assertBindings.js";
export { default as assertBindingsLive } from "./assertBindingsLive.js";
export { default as defineBinding } from "./defineBinding.js";
export type { EntityBinding, GraphQLExecute } from "./types.js";
