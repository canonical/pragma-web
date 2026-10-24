import type { Homes } from "@canonical/prism-core";
import { CODE_STANDARDS_NAMESPACE } from "#domains/standards";

/**
 * The site's homes: the page each kind of graph node lives on, so every
 * mention of a node links there. Components live on their entity page and
 * ontology classes in the Definitions lens, each addressed by the compact
 * address the mention resolves it with. Code standards live on their
 * reading page in the Standards lens, which is addressed by the absolute
 * IRI, so their home expands the `cs:` prefix. A type with no entry has no
 * home and its mentions read as text.
 */
export const homes: Homes = {
  Component: (node, router) =>
    router.buildPath("componentEntity", { params: { uri: node.uri } }),
  OntologyClass: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
  CodeStandard: (node, router) =>
    router.buildPath("standardEntity", {
      params: { uri: node.uri.replace(/^cs:/, CODE_STANDARDS_NAMESPACE) },
    }),
};
