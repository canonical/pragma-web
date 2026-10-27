// @vitest-environment node

import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createMetroFetch from "../../../testing/createMetroFetch.js";
import { METRO_NAMESPACE } from "../../../testing/fixtures.js";
import warmNetworkNode from "./warmNetworkNode.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

/** Publish `environment`, start the warm, and clear the slot again before
 * anything is awaited, as the server's prepare step does. */
const warmLikeTheServer = (
  environment: ReturnType<typeof createEnvironment>,
  kind: "line" | "stop",
  params: Readonly<Record<string, unknown>>,
): Promise<void> => {
  setPrefetchEnvironment(environment);
  try {
    return warmNetworkNode(kind, params);
  } finally {
    setPrefetchEnvironment(undefined);
  }
};

describe("warmNetworkNode", () => {
  it("resolves with no request when no environment is published", async () => {
    await expect(
      warmNetworkNode("stop", { uri: "metro:tannery-lane" }),
    ).resolves.toBeUndefined();
  });

  it("throws on params with no address, before reading the slot", () => {
    expect(() => warmNetworkNode("stop", {})).toThrow(/non-empty string/);
  });

  it("reads the namespaces, then the station the address expands to", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), "stop", {
      uri: "metro:tannery-lane",
    });
    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "NetworkNamespacesQuery",
      "NetworkStationQuery",
    ]);
    const [, variables] = fetchFn.mock.lastCall ?? [];
    expect(variables).toEqual({ id: `${METRO_NAMESPACE}tannery-lane` });
  });

  it("reads the line an absolute address names", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), "line", {
      uri: `${METRO_NAMESPACE}circle-line`,
    });
    const [request] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("NetworkLineQuery");
  });

  it("reads a station no route calls at, as every other", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), "stop", {
      uri: "metro:ghost",
    });
    const [, variables] = fetchFn.mock.lastCall ?? [];
    expect(variables).toEqual({ id: `${METRO_NAMESPACE}ghost` });
  });

  it("makes no request when the store already holds both operations", async () => {
    const fetchFn = createMetroFetch();
    const environment = createEnvironment({ fetchFn });
    await warmLikeTheServer(environment, "line", { uri: "metro:north-line" });
    fetchFn.mockClear();
    await warmLikeTheServer(environment, "line", { uri: "metro:north-line" });
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
