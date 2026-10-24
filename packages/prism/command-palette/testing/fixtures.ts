/**
 * Static fixtures shared by the package's suites and stories: the site the
 * palette opens homes in, and search results exactly as a provider answers
 * them.
 */

import type { HomeNode, HomeResolver, Homes } from "@canonical/prism-core";
import { type Router, route } from "@canonical/router-core";
import type { ClassPayload, NodePayload } from "./types.js";

/** A site's route table with one entity page, addressed by the entity. */
export const ROUTES = {
  thing: route({ url: "/things/:uri", content: () => null }),
} as const;

/** Build the thing page's href for `node`, through the router. */
const buildThingPath = (
  node: HomeNode,
  router: Router<typeof ROUTES>,
): string => router.buildPath("thing", { params: { uri: node.uri } });

/**
 * The site's homes: components and ontology classes live on the thing page;
 * stations have none. Typed over the fixture table: a site registers its own
 * route map, a test cannot.
 */
export const HOMES: Homes = {
  Component: buildThingPath as unknown as HomeResolver,
  OntologyClass: buildThingPath as unknown as HomeResolver,
};

/** A UI block of the design system, a type the site homes. */
export const COMPONENT_NODE: NodePayload = {
  __typename: "Component",
  __isNode: "Component",
  uri: "https://ds.canonical.com/global.component.layout-switcher",
  _meta: {
    curie: "ds:global.component.layout-switcher",
    title: "Layout switcher",
    definition: "A control that switches the layout a page shows its items in.",
    type: {
      uri: "https://ds.canonical.com/Component",
      _meta: { title: "Component" },
    },
  },
};

/** An ontology class, a type the site homes and the package arms. */
export const ONTOLOGY_CLASS_NODE: ClassPayload = {
  __typename: "OntologyClass",
  __isNode: "OntologyClass",
  uri: "https://ds.canonical.com/Layout",
  isAbstract: true,
  definition:
    "Layouts are an opinionated division of space to navigate a domain of information.",
  instanceCount: 88,
  superclass: {
    uri: "https://ds.canonical.com/UIBlock",
    _meta: { title: "UI Block" },
  },
  _meta: {
    curie: "ds:Layout",
    title: "Layout",
    definition:
      "Layouts are an opinionated division of space to navigate a domain of information.",
    type: {
      uri: "http://www.w3.org/2002/07/owl#Class",
      _meta: { title: "Class" },
    },
  },
};

/** A second UI block, ranked after the class it shares no type with. */
export const SECOND_COMPONENT_NODE: NodePayload = {
  __typename: "Component",
  __isNode: "Component",
  uri: "https://ds.canonical.com/global.component.player-layout",
  _meta: {
    curie: "ds:global.component.player-layout",
    title: "Player layout",
    definition: "The layout of a media player's controls.",
    type: {
      uri: "https://ds.canonical.com/Component",
      _meta: { title: "Component" },
    },
  },
};

/** A node of a type the site does not home. */
export const STATION_NODE: NodePayload = {
  __typename: "Station",
  __isNode: "Station",
  uri: "https://metro.example/station/layton",
  _meta: {
    curie: "metro:station/layton",
    title: "Layton",
    definition: null,
    type: { uri: "https://metro.example/Station", _meta: { title: "Station" } },
  },
};

/**
 * Three results of two types, in rank order: a component, a class, then a
 * second component, which joins the first one's group.
 */
export const RANKED_RESULTS: readonly NodePayload[] = [
  COMPONENT_NODE,
  ONTOLOGY_CLASS_NODE,
  SECOND_COMPONENT_NODE,
];

/** The href the site's `thing` route builds for `COMPONENT_NODE`. */
export const COMPONENT_HREF = "/things/ds%3Aglobal.component.layout-switcher";

/** The href the site's `thing` route builds for `ONTOLOGY_CLASS_NODE`. */
export const ONTOLOGY_CLASS_HREF = "/things/ds%3ALayout";
