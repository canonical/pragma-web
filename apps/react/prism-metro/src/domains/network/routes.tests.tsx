// @vitest-environment node

import {
  collectLenses,
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { createRouter } from "@canonical/router-core";
import { afterEach, describe, expect, it } from "vitest";
import createMetroFetch from "../../../testing/createMetroFetch.js";
import { NetworkLinePage } from "./lib/NetworkLinePage/index.js";
import { NetworkMap } from "./lib/NetworkMap/index.js";
import { NetworkStationPage } from "./lib/NetworkStationPage/index.js";
import { networkRoutes } from "./routes.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

/** What the router hands a route's `warm` besides its params and search. */
const CONTEXT = { signal: new AbortController().signal };

// Without an adapter the router is a pure matcher: building it runs no load
// and no `warm`.
const router = createRouter(networkRoutes);

describe("networkRoutes", () => {
  it("declares the network lens first in the rail, at tier 2", () => {
    expect(
      collectLenses(networkRoutes).map(({ name, label, order, tier }) => ({
        name,
        label,
        order,
        tier,
      })),
    ).toEqual([{ name: "network", label: "Network", order: 0, tier: 2 }]);
  });

  it("builds the map's, a station's and a line's paths", () => {
    expect([
      router.buildPath("network"),
      router.buildPath("networkStation", {
        params: { uri: "metro:tannery-lane" },
      }),
      router.buildPath("networkLine", { params: { uri: "metro:circle-line" } }),
    ]).toEqual([
      "/network",
      "/network/stations/metro%3Atannery-lane",
      "/network/lines/metro%3Acircle-line",
    ]);
  });

  it("renders the map on the lens's own route", () => {
    const map = networkRoutes.network.content({ params: {}, search: {} });
    expect(map.type).toBe(NetworkMap);
  });

  it("hands each page the address its route matched", () => {
    const station = networkRoutes.networkStation.content({
      params: { uri: "metro:tannery-lane" },
      search: {},
    });
    const line = networkRoutes.networkLine.content({
      params: { uri: "metro:circle-line" },
      search: {},
    });
    expect(station.type).toBe(NetworkStationPage);
    expect(station.props).toEqual({ address: "metro:tannery-lane" });
    expect(line.type).toBe(NetworkLinePage);
    expect(line.props).toEqual({ address: "metro:circle-line" });
  });

  it("warms each route through its own operation", async () => {
    const fetchFn = createMetroFetch();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));
    await networkRoutes.network.warm?.({}, {}, CONTEXT);
    await networkRoutes.networkStation.warm?.(
      { uri: "metro:tannery-lane" },
      {},
      CONTEXT,
    );
    await networkRoutes.networkLine.warm?.(
      { uri: "metro:circle-line" },
      {},
      CONTEXT,
    );
    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "NetworkMapQuery",
      "NetworkNamespacesQuery",
      "NetworkStationQuery",
      "NetworkLineQuery",
    ]);
  });
});
