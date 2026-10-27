// @vitest-environment node

import { collectLenses } from "@canonical/prism-core";
import { createRouter } from "@canonical/router-core";
import { describe, expect, it } from "vitest";
import { HOME_LENS_MESSAGES } from "#domains/metro";
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
  it("declares the site's four lenses, in rail order", () => {
    expect(
      collectLenses(appRoutes).map(({ name, label, order, tier }) => ({
        name,
        label,
        order,
        tier,
      })),
    ).toEqual([
      { name: "network", label: "Network", order: 0, tier: 2 },
      { name: "stations", label: "Stations", order: 1, tier: 1 },
      { name: "lines", label: "Lines", order: 2, tier: 1 },
      { name: "definitions", label: "Definitions", order: 3, tier: 1 },
      { name: "fleet", label: "Fleet", order: 5, tier: 2 },
    ]);
  });

  it("builds the ten route names the register carries", () => {
    expect([
      router.buildPath("home"),
      router.buildPath("network"),
      router.buildPath("networkStation", { params: { uri: NORTHGATE_CURIE } }),
      router.buildPath("networkLine", { params: { uri: CIRCLE_LINE_CURIE } }),
      router.buildPath("stations"),
      router.buildPath("stationsEntity", { params: { uri: NORTHGATE_CURIE } }),
      router.buildPath("lines"),
      router.buildPath("linesEntity", { params: { uri: CIRCLE_LINE_CURIE } }),
      router.buildPath("definitions"),
      router.buildPath("definitionsTerm", {
        params: { term: STATION_CLASS_CURIE },
      }),
    ]).toEqual([
      "/",
      "/network",
      "/network/stations/metro%3Anorthgate",
      "/network/lines/metro%3Acircle-line",
      "/stations",
      "/stations/metro%3Anorthgate",
      "/lines",
      "/lines/metro%3Acircle-line",
      "/definitions",
      "/definitions/metro%3AStation",
    ]);
  });

  it("builds the fleet lens's five route names", () => {
    expect([
      router.buildPath("fleet"),
      router.buildPath("fleetStock", { params: { uri: "metro:series-90" } }),
      router.buildPath("fleetFormation", {
        params: { uri: "metro:series-90-six-car" },
      }),
      router.buildPath("fleetUnit", { params: { uri: "metro:unit-90" } }),
      router.buildPath("fleetCarType", {
        params: { uri: "metro:car-90-driving" },
      }),
    ]).toEqual([
      "/fleet",
      "/fleet/metro%3Aseries-90",
      "/fleet/formations/metro%3Aseries-90-six-car",
      "/fleet/units/metro%3Aunit-90",
      "/fleet/car-types/metro%3Acar-90-driving",
    ]);
  });

  it("matches a formation's address to its page, not to a stock's", () => {
    const match = router.match("/fleet/formations/metro%3Aseries-90-six-car");
    expect(match?.kind === "route" && match.name).toBe("fleetFormation");
  });

  it("lands an unknown URL on the not-found route", () => {
    expect(router.match("/nowhere")?.kind).toBe("not-found");
  });

  it("lands the root on the home route", () => {
    const match = router.match("/");
    expect(match?.kind).toBe("route");
    expect(match?.kind === "route" ? match.name : undefined).toBe("home");
  });

  it("keeps the landing out of the rail", () => {
    expect(collectLenses(appRoutes).map(({ name }) => name)).not.toContain(
      "home",
    );
  });

  it("gives every lens a door on the landing, in rail order", () => {
    expect(collectLenses(appRoutes).map(({ name }) => name)).toEqual(
      Object.keys(HOME_LENS_MESSAGES),
    );
  });
});
