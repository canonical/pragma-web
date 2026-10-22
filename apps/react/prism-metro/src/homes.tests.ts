// @vitest-environment node

import { createRouter } from "@canonical/router-core";
import { describe, expect, it } from "vitest";
import {
  CENTRAL_EXCHANGE_CURIE,
  CIRCLE_LINE_CURIE,
  NORTHGATE_CURIE,
  STATION_CLASS_CURIE,
} from "../testing/fixtures.js";
import { homes } from "./homes.js";
import { appRoutes } from "./routes.js";

// Without an adapter the router is a pure matcher: it builds paths and runs
// no load.
const router = createRouter(appRoutes);

/**
 * Resolve the home of a node of `typename` at `uri` through the site's
 * homes, or `undefined` when the site declares none for the type.
 */
const resolveHome = (typename: string, uri: string): string | undefined =>
  homes[typename]?.({ __typename: typename, uri }, router);

describe("homes", () => {
  it("homes a station on its stations entity page", () => {
    expect(resolveHome("Station", NORTHGATE_CURIE)).toBe(
      "/stations/metro%3Anorthgate",
    );
  });

  it("homes an interchange on the stations lens too", () => {
    expect(resolveHome("Interchange", CENTRAL_EXCHANGE_CURIE)).toBe(
      "/stations/metro%3Acentral-exchange",
    );
  });

  it("homes a line on its lines entity page", () => {
    expect(resolveHome("Line", CIRCLE_LINE_CURIE)).toBe(
      "/lines/metro%3Acircle-line",
    );
  });

  it("homes ontology classes and properties on their term view", () => {
    expect(resolveHome("OntologyClass", STATION_CLASS_CURIE)).toBe(
      "/definitions/metro%3AStation",
    );
    expect(resolveHome("OntologyProperty", "metro:servesLine")).toBe(
      "/definitions/metro%3AservesLine",
    );
  });

  it("gives a fare zone no home", () => {
    expect(homes.Zone).toBeUndefined();
    expect(homes.Node).toBeUndefined();
  });
});
