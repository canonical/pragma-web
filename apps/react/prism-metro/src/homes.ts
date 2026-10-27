import type { Homes } from "@canonical/prism-core";

/**
 * The site's homes: the page each kind of graph node lives on, so every
 * mention of a node links there, addressed by the compact address the
 * mention resolves it with. Stations and interchanges, the station subclass
 * the graph serves as its own type, and lines live in the network lens,
 * where a station's page shows its place on every route and a line's page
 * its strips; rolling stocks, formations, units and car types in the fleet
 * lens; ontology classes and properties in the Definitions lens. A
 * type with no entry, such as a fare zone, has no home, and its mentions
 * read as text.
 */
export const homes: Homes = {
  Station: (node, router) =>
    router.buildPath("networkStation", { params: { uri: node.uri } }),
  Interchange: (node, router) =>
    router.buildPath("networkStation", { params: { uri: node.uri } }),
  Line: (node, router) =>
    router.buildPath("networkLine", { params: { uri: node.uri } }),
  RollingStock: (node, router) =>
    router.buildPath("fleetStock", { params: { uri: node.uri } }),
  Formation: (node, router) =>
    router.buildPath("fleetFormation", { params: { uri: node.uri } }),
  Unit: (node, router) =>
    router.buildPath("fleetUnit", { params: { uri: node.uri } }),
  CarType: (node, router) =>
    router.buildPath("fleetCarType", { params: { uri: node.uri } }),
  OntologyClass: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
  OntologyProperty: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
};
