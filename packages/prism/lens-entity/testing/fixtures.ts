/**
 * The static data the lens's tests share: the two bindings a site over the
 * metro graph would declare, the route table and the homes it would mount
 * them with, the entities and addresses the metro graph serves, and the
 * timeout of the full-stack suites.
 */

import { defineBinding, type Homes } from "@canonical/prism-core";
import createEntityRoutes from "../src/lib/createEntityRoutes.js";
import type { EntityLensOptions } from "../src/lib/types.js";

/** The metro graph's stations, interchanges among them. */
export const STATIONS_BINDING = defineBinding({
  id: "stations",
  classUri: "metro:Station",
  typename: "Station",
});

/** The metro graph's lines. */
export const LINES_BINDING = defineBinding({
  id: "lines",
  classUri: "metro:Line",
  typename: "Line",
});

/** The stations lens's label and rail order. */
export const STATIONS_LENS: EntityLensOptions = { label: "Stations", order: 1 };

/** The lines lens's label and rail order. */
export const LINES_LENS: EntityLensOptions = { label: "Lines", order: 2 };

/** A site's route table holding both lenses. */
export const SITE_ROUTES = {
  ...createEntityRoutes(STATIONS_BINDING, STATIONS_LENS),
  ...createEntityRoutes(LINES_BINDING, LINES_LENS),
};

/**
 * The homes such a site declares: a station, and an interchange (a station
 * subclass served as its own GraphQL type), on the stations lens's entity
 * route; a line on the lines lens's. Each is addressed by the compact form
 * the projections hand a home (`_meta.curie`).
 */
export const HOMES: Homes = {
  Station: (node, router) =>
    router.buildPath("stationsEntity", { params: { uri: node.uri } }),
  Interchange: (node, router) =>
    router.buildPath("stationsEntity", { params: { uri: node.uri } }),
  Line: (node, router) =>
    router.buildPath("linesEntity", { params: { uri: node.uri } }),
};

/** The namespaces the metro graph declares, in its own order. */
export const METRO_NAMESPACES = [
  { prefix: "metro", namespace: "https://metro.example/onto#" },
  { prefix: "geo", namespace: "https://geo.example/onto#" },
  { prefix: "rdfs", namespace: "http://www.w3.org/2000/01/rdf-schema#" },
] as const;

/** A station, by its compact address. */
export const NORTHGATE_CURIE = "metro:northgate";

/** The same station, by its absolute IRI. */
export const NORTHGATE_IRI = "https://metro.example/onto#northgate";

/** An interchange: a station subclass, served as its own GraphQL type. */
export const CENTRAL_EXCHANGE_CURIE = "metro:central-exchange";

/** A line, which is no station. */
export const CIRCLE_LINE_CURIE = "metro:circle-line";

/** An address nothing in the metro graph answers to. */
export const UNKNOWN_ADDRESS = "metro:nowhere";

/** How many stations the metro graph carries, interchanges included. */
export const STATION_COUNT = 16;

/**
 * The per-test timeout of the suites that mount the full provider stack over
 * the metro graph: under heavy parallel load they can overrun vitest's 5s
 * default. Per test only; the config default stands.
 */
export const ENTITY_TEST_TIMEOUT_MS = 20_000;
