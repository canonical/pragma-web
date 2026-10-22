// @vitest-environment node

import { collectLenses } from "@canonical/prism-core";
import { createRouter } from "@canonical/router-core";
import { describe, expect, it } from "vitest";
import {
  CIRCLE_LINE_CURIE,
  NORTHGATE_CURIE,
  STATION_CLASS_CURIE,
} from "../testing/fixtures.js";
import { appRoutes, notFoundRoute } from "./routes.js";

// Without an adapter the router is a pure matcher: building it runs no load
// and no `warm`.
const router = createRouter(appRoutes, { notFound: notFoundRoute });

describe("appRoutes", () => {
  it("declares the site's three lenses, in rail order", () => {
    expect(
      collectLenses(appRoutes).map(({ name, label, order, tier }) => ({
        name,
        label,
        order,
        tier,
      })),
    ).toEqual([
      { name: "stations", label: "Stations", order: 1, tier: 1 },
      { name: "lines", label: "Lines", order: 2, tier: 1 },
      { name: "definitions", label: "Definitions", order: 3, tier: 1 },
    ]);
  });

  it("builds the six route names the register carries", () => {
    expect([
      router.buildPath("stations"),
      router.buildPath("stationsEntity", { params: { uri: NORTHGATE_CURIE } }),
      router.buildPath("lines"),
      router.buildPath("linesEntity", { params: { uri: CIRCLE_LINE_CURIE } }),
      router.buildPath("definitions"),
      router.buildPath("definitionsTerm", {
        params: { term: STATION_CLASS_CURIE },
      }),
    ]).toEqual([
      "/stations",
      "/stations/metro%3Anorthgate",
      "/lines",
      "/lines/metro%3Acircle-line",
      "/definitions",
      "/definitions/metro%3AStation",
    ]);
  });

  it("lands an unknown URL on the not-found route", () => {
    expect(router.match("/nowhere")?.kind).toBe("not-found");
  });

  it("has no route at the root", () => {
    expect(router.match("/")?.kind).toBe("not-found");
  });
});
