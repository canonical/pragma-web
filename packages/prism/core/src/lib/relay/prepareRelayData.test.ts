// @vitest-environment node

/**
 * The prepare step's matching and degradation paths, with `globalThis.fetch`
 * stubbed: which URLs warm a store, which prepare nothing without a
 * request, and what the step forwards to the graph.
 */

import type { RouteMiddleware } from "@canonical/router-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PING_QUERY,
  PING_RESPONSE,
  WARM_NOT_FOUND,
  WARM_ROUTES,
} from "../../../testing/fixtures.js";
import prefetchQuery from "./prefetchQuery.js";
import prepareRelayData from "./prepareRelayData.js";

const GRAPHQL_URL = "http://graph.test/graphql";

const originalFetch = globalThis.fetch;
let fetchSpy: ReturnType<typeof vi.fn<typeof fetch>>;
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchSpy = vi.fn<typeof fetch>().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(PING_RESPONSE), {
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
  globalThis.fetch = fetchSpy;
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  consoleError.mockRestore();
});

describe("prepareRelayData", () => {
  it("returns the warmed store's records for a route with a warm", async () => {
    const prepared = await prepareRelayData("/ping", GRAPHQL_URL, {
      routes: WARM_ROUTES,
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls.at(0)?.at(0)).toBe(GRAPHQL_URL);
    expect(prepared?.records["client:root"]).toMatchObject({ ping: "pong" });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("resolves undefined without a request for a route with no warm", async () => {
    const prepared = await prepareRelayData("/quiet", GRAPHQL_URL, {
      routes: WARM_ROUTES,
    });
    expect(prepared).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("resolves undefined without a request for an unmatched URL", async () => {
    const prepared = await prepareRelayData("/nowhere", GRAPHQL_URL, {
      routes: WARM_ROUTES,
    });
    expect(prepared).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("resolves undefined without a request for a redirect", async () => {
    const prepared = await prepareRelayData("/legacy", GRAPHQL_URL, {
      routes: WARM_ROUTES,
    });
    expect(prepared).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("resolves undefined without a request for the not-found page", async () => {
    // The not-found route here has a warm of its own; the step still
    // prepares nothing for it.
    const prepared = await prepareRelayData("/nowhere", GRAPHQL_URL, {
      routes: WARM_ROUTES,
      notFound: WARM_NOT_FOUND,
    });
    expect(prepared).toBeUndefined();
  });

  it("degrades to undefined, logged, when the route's warm throws", async () => {
    const prepared = await prepareRelayData("/failing", GRAPHQL_URL, {
      routes: WARM_ROUTES,
    });
    expect(prepared).toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        `relay prepare failed for /failing against ${GRAPHQL_URL}`,
      ),
      expect.objectContaining({ message: "warm failed" }),
    );
  });

  it("matches through the site's middleware", async () => {
    // A middleware that gives the quiet route a warm: the step must match
    // the route the middleware returns, not the one in the table.
    const giveQuietAWarm: RouteMiddleware = (route) =>
      route.url === "/quiet"
        ? { ...route, warm: () => prefetchQuery(PING_QUERY, {}) }
        : route;
    const prepared = await prepareRelayData("/quiet", GRAPHQL_URL, {
      routes: WARM_ROUTES,
      middleware: [giveQuietAWarm],
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(prepared?.records["client:root"]).toMatchObject({ ping: "pong" });
  });

  it("stamps the given headers onto its graph request", async () => {
    await prepareRelayData("/ping", GRAPHQL_URL, {
      routes: WARM_ROUTES,
      headers: { "x-server-render": "1" },
    });
    const init = fetchSpy.mock.calls.at(0)?.at(1) as RequestInit;
    expect(new Headers(init.headers).get("x-server-render")).toBe("1");
  });
});
