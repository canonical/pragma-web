/**
 * Static fixtures shared by the package's suites and stories: graph payloads
 * exactly as a provider answers them, the mock resolvers that answer them in
 * a Relay mock environment, and the site the projections link into.
 */

import type { HomeNode, HomeResolver, Homes } from "@canonical/prism-core";
import { type Router, route } from "@canonical/router-core";
import type { MockResolvers } from "relay-test-utils";
import type { NodePayload } from "./types.js";

/** A site's route table with one entity page, addressed by the entity. */
export const THING_ROUTES = {
  thing: route({ url: "/things/:uri", content: () => null }),
} as const;

/** Build the thing page's href for `node`, through the router. */
const buildThingPath = (
  node: HomeNode,
  router: Router<typeof THING_ROUTES>,
): string => router.buildPath("thing", { params: { uri: node.uri } });

/**
 * The site's homes: ontology classes and properties live on the thing page.
 * Typed over the fixture table: a site registers its own route map, a test
 * cannot.
 */
export const HOMES: Homes = {
  OntologyClass: buildThingPath as unknown as HomeResolver,
  OntologyProperty: buildThingPath as unknown as HomeResolver,
};

/**
 * The entities the stories render, one per type the package projects, read
 * off the projection matrix: as a Relay mock environment's resolvers, by the
 * GraphQL type each answers. A `Node` is a UI block; an `OntologyClass` the
 * abstract class Layout; an `OntologyProperty` the object property
 * `modifier`.
 */
export const MOCK_RESOLVERS: MockResolvers = {
  Node: () => ({
    __typename: "Component",
    _meta: {
      title: "IconButton",
      curie: "ds:global.component.icon-button",
      definition: "A button is an interactive element that triggers a command.",
      type: { _meta: { title: "Component" } },
    },
  }),
  OntologyClass: () => ({
    __typename: "OntologyClass",
    isAbstract: true,
    instanceCount: 88,
    definition:
      "Layouts are an opinionated division of space to navigate a domain of information.",
    _meta: { title: "Layout", curie: "ds:Layout" },
    superclass: { _meta: { title: "UIBlock" } },
  }),
  OntologyProperty: () => ({
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/modifier",
    label: "modifier",
    kind: "OBJECT",
    range: "ds:Modifier",
    functional: false,
    definition: "The modifier that changes how a block looks or behaves.",
    domain: { _meta: { title: "UIBlock" } },
    inverse: { uri: "https://ds.canonical.com/modifies", label: "modifies" },
  }),
};

/** A node of a type the site homes: an ontology class. */
export const ONTOLOGY_CLASS_NODE: NodePayload = {
  __typename: "OntologyClass",
  uri: "https://ds.canonical.com/UIBlock",
  _meta: {
    curie: "ds:UIBlock",
    title: "UI Block",
    type: { uri: "http://www.w3.org/2002/07/owl#Class" },
  },
};

/** A node of a type no map names and the site does not home. */
export const STATION_NODE: NodePayload = {
  __typename: "Station",
  uri: "https://metro.example/station/kings-cross",
  _meta: {
    curie: "metro:station/kings-cross",
    title: "King's Cross",
    type: { uri: "https://metro.example/Station" },
  },
};

/** The href the site's `thing` route builds for `ONTOLOGY_CLASS_NODE`. */
export const ONTOLOGY_CLASS_HREF = "/things/ds%3AUIBlock";

/** The class whose instances a page's prose links to. */
export const REFERENCING_CLASS_URI = "https://ds.canonical.com/Component";

/**
 * A page's prose references: one node a link reaches by its IRI, one it
 * reaches by its compact address.
 */
export const PROSE_REFERENCES = {
  edges: [{ node: ONTOLOGY_CLASS_NODE }, { node: STATION_NODE }],
} as const;

/** A link that names no reference. */
export const UNREFERENCED_HREF = "https://example.com/elsewhere";
