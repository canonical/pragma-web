import type { Homes } from "@canonical/prism-core";

/**
 * The site's homes: the page each kind of graph node lives on, so every
 * mention of a node links there. Components live on their entity page and
 * ontology classes in the Definitions lens, each addressed by the compact
 * address the mention resolves it with. A type with no entry has no home
 * and its mentions read as text.
 */
export const homes: Homes = {
  Component: (node, router) =>
    router.buildPath("componentEntity", { params: { uri: node.uri } }),
  OntologyClass: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
};
