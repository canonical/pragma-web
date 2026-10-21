// @vitest-environment node

/**
 * The prepare step's no-data paths, over the app's real route table: a URL
 * whose route has no `warm`, and a URL no route matches, both resolve to
 * `undefined` without dialling the graph.
 */

import { describe, expect, it, vi } from "vitest";
import prepareRelayData from "./prepareRelayData.js";

/**
 * A deliberately dead endpoint. Neither case below may reach the network,
 * and a bogus URL keeps the suite honest: a request that did slip out
 * would fail to connect, and the prepare step would log that failure,
 * which the "logs nothing" assertion catches.
 */
const DEAD_GRAPHQL_URL = "http://127.0.0.1:1/graphql";

/** Runs `prepareRelayData` with the degradation log silenced and captured. */
const prepareSilenced = async (url: string) => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const prepared = await prepareRelayData(url, DEAD_GRAPHQL_URL);
    return { prepared, consoleError: consoleError.mock.calls };
  } finally {
    consoleError.mockRestore();
  }
};

describe("prepareRelayData", () => {
  it("resolves undefined without a request for a route with no warm", async () => {
    // The guide reading detail is authored prose with no graph query.
    const { prepared, consoleError } = await prepareSilenced(
      "/guides/getting-started",
    );
    expect(prepared).toBeUndefined();
    expect(consoleError).toEqual([]);
  });

  it("resolves undefined without a request for an unmatched URL", async () => {
    const { prepared, consoleError } = await prepareSilenced("/no-such-route");
    expect(prepared).toBeUndefined();
    expect(consoleError).toEqual([]);
  });
});
