/**
 * Static fixtures shared by the package's suites.
 */

import { route } from "@canonical/router-core";
import { createElement, type ReactElement } from "react";
import type { ConcreteRequest } from "relay-runtime";
import { prefetchQuery } from "../src/lib/relay/index.js";
import { routeLensFacet } from "../src/lib/routeLens/index.js";
import { routeShortcutFacet } from "../src/lib/routeShortcut/index.js";

/** A decorative rail glyph, as a lens declares one. */
const FixtureIcon = (): ReactElement =>
  createElement("svg", { "aria-hidden": true, "data-icon": "fixture" });

/** Route content that renders nothing. */
const BlankPage = (): null => null;

/**
 * A small site's route table: three lenses whose index routes each declare a
 * lens and claim a shortcut, and one parameterised route that declares
 * neither.
 */
export const LENS_ROUTES = {
  home: route({
    url: "/",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Home",
        icon: FixtureIcon,
        order: 1,
        tier: 2,
      }),
      ...routeShortcutFacet.of("1"),
    },
  }),
  catalog: route({
    url: "/catalog",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Catalog",
        icon: FixtureIcon,
        order: 2,
        tier: 1,
      }),
      ...routeShortcutFacet.of("2"),
    },
  }),
  glossary: route({
    url: "/glossary",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Glossary",
        icon: FixtureIcon,
        order: 3,
        tier: 1,
      }),
      ...routeShortcutFacet.of("3"),
    },
  }),
  glossaryTerm: route({ url: "/glossary/:term", content: BlankPage }),
} as const;

/**
 * A compiled operation, written by hand in relay-compiler's artifact shape:
 * `query PrismCorePingQuery { ping }`. One scalar root field, no variables.
 */
export const PING_QUERY: ConcreteRequest = {
  fragment: {
    argumentDefinitions: [],
    kind: "Fragment",
    metadata: null,
    name: "PrismCorePingQuery",
    selections: [
      {
        alias: null,
        args: null,
        kind: "ScalarField",
        name: "ping",
        storageKey: null,
      },
    ],
    type: "Query",
    abstractKey: null,
  },
  kind: "Request",
  operation: {
    argumentDefinitions: [],
    kind: "Operation",
    name: "PrismCorePingQuery",
    selections: [
      {
        alias: null,
        args: null,
        kind: "ScalarField",
        name: "ping",
        storageKey: null,
      },
    ],
  },
  params: {
    cacheID: "prism-core-ping",
    id: null,
    metadata: {},
    name: "PrismCorePingQuery",
    operationKind: "query",
    text: "query PrismCorePingQuery {\n  ping\n}\n",
  },
};

/** The graph's answer to {@link PING_QUERY}. */
export const PING_RESPONSE = { data: { ping: "pong" } } as const;

/** A linked selection of `uri` and `name`, as both artifact halves spell it. */
const ENTITY_SELECTIONS = [
  {
    alias: null,
    args: null,
    concreteType: "Entity",
    kind: "LinkedField",
    name: "entity",
    plural: false,
    selections: [
      {
        alias: null,
        args: null,
        kind: "ScalarField",
        name: "uri",
        storageKey: null,
      },
      {
        alias: null,
        args: null,
        kind: "ScalarField",
        name: "name",
        storageKey: null,
      },
    ],
    storageKey: null,
  },
  {
    alias: null,
    args: null,
    concreteType: "Note",
    kind: "LinkedField",
    name: "note",
    plural: false,
    selections: [
      {
        alias: null,
        args: null,
        kind: "ScalarField",
        name: "text",
        storageKey: null,
      },
    ],
    storageKey: null,
  },
] as const;

/**
 * A compiled operation, written by hand in relay-compiler's artifact shape:
 * `query PrismCoreEntityQuery { entity { uri name } note { text } }`. The
 * entity is addressable by its `uri`; the note has none.
 */
export const ENTITY_QUERY: ConcreteRequest = {
  fragment: {
    argumentDefinitions: [],
    kind: "Fragment",
    metadata: null,
    name: "PrismCoreEntityQuery",
    selections: ENTITY_SELECTIONS,
    type: "Query",
    abstractKey: null,
  },
  kind: "Request",
  operation: {
    argumentDefinitions: [],
    kind: "Operation",
    name: "PrismCoreEntityQuery",
    selections: ENTITY_SELECTIONS,
  },
  params: {
    cacheID: "prism-core-entity",
    id: null,
    metadata: {},
    name: "PrismCoreEntityQuery",
    operationKind: "query",
    text: "query PrismCoreEntityQuery {\n  entity {\n    uri\n    name\n  }\n  note {\n    text\n  }\n}\n",
  },
};

/** The addressable entity {@link ENTITY_QUERY} answers with. */
export const ENTITY_URI = "https://example.org/things#button";

/** The graph's answer to {@link ENTITY_QUERY}. */
export const ENTITY_RESPONSE = {
  data: {
    entity: { uri: ENTITY_URI, name: "Button" },
    note: { text: "A note without an address." },
  },
} as const;

/**
 * A route table whose routes warm the Relay store through the prefetch
 * environment, the way a site's data-bearing routes do: one warms
 * {@link PING_QUERY}, one {@link ENTITY_QUERY}, one declares no `warm`, one
 * throws from its `warm`, and one redirects.
 */
export const WARM_ROUTES = {
  ping: route({
    url: "/ping",
    content: BlankPage,
    warm: () => prefetchQuery(PING_QUERY, {}),
  }),
  entity: route({
    url: "/entity",
    content: BlankPage,
    warm: () => prefetchQuery(ENTITY_QUERY, {}),
  }),
  quiet: route({ url: "/quiet", content: BlankPage }),
  failing: route({
    url: "/failing",
    content: BlankPage,
    warm: () => {
      throw new Error("warm failed");
    },
  }),
  legacy: route({ url: "/legacy", redirect: "/ping", status: 301 }),
} as const;

/** The not-found route paired with {@link WARM_ROUTES}. */
export const WARM_NOT_FOUND = route({
  url: "/404",
  content: BlankPage,
  warm: () => prefetchQuery(PING_QUERY, {}),
});

/** A site's namespace prefixes, in the order its provider lists them. */
export const PREFIXES = ["ds", "cs", "docs"] as const;

/**
 * A provider schema in SDL: `Station` implements `Node` (half in its
 * definition, half in an extension), `Line` does not, and `Query` serves
 * the binding probe.
 */
export const NODE_SDL = `
interface Node {
  uri: ID!
}

interface Named {
  name: String
}

type Station implements Named {
  uri: ID!
  name: String
}

extend type Station implements Node

type Line {
  uri: ID!
}

type OntologyClass {
  uri: ID!
}

type Query {
  ontologyClass(uri: String!): OntologyClass
}
`;

/** A schema with no `Node` interface at all. */
export const NO_NODE_SDL = `
type Station {
  uri: ID!
}

type Query {
  station: Station
}
`;
