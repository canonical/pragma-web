// @vitest-environment node

import {
  createEnvironment,
  setPrefetchEnvironment,
  type ViewSearch,
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
  search: ViewSearch = {},
): Promise<void> => {
  setPrefetchEnvironment(environment);
  try {
    return warmNetworkNode(kind, params, search);
  } finally {
    setPrefetchEnvironment(undefined);
  }
};

/** The variables of the first request `fetchFn` made for `name`. */
const findVariables = (
  fetchFn: ReturnType<typeof createMetroFetch>,
  name: string,
): unknown =>
  fetchFn.mock.calls.find(([request]) => request.name === name)?.at(1);

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
      "EntityPanelQuery",
      "EntityStatementsQuery",
    ]);
    expect(findVariables(fetchFn, "NetworkStationQuery")).toEqual({
      id: `${METRO_NAMESPACE}tannery-lane`,
    });
    // The aside's details panel reads the same IRI; the store already holds
    // the namespaces it reads.
    expect(findVariables(fetchFn, "EntityPanelQuery")).toEqual({
      id: `${METRO_NAMESPACE}tannery-lane`,
    });
  });

  it("warms the station's Turtle source beside its page at as=turtle", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(
      createEnvironment({ fetchFn }),
      "stop",
      { uri: "metro:tannery-lane" },
      { as: "turtle" },
    );
    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "NetworkNamespacesQuery",
      "NetworkStationQuery",
      "EntitySourceQuery",
      "EntityPanelQuery",
      "EntityStatementsQuery",
    ]);
    expect(findVariables(fetchFn, "EntitySourceQuery")).toEqual({
      uri: `${METRO_NAMESPACE}tannery-lane`,
    });
  });

  it("reads the line an absolute address names", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), "line", {
      uri: `${METRO_NAMESPACE}circle-line`,
    });
    expect(findVariables(fetchFn, "NetworkLineQuery")).toEqual({
      id: `${METRO_NAMESPACE}circle-line`,
    });
  });

  it("reads a station no route calls at, as every other", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), "stop", {
      uri: "metro:ghost",
    });
    expect(findVariables(fetchFn, "NetworkStationQuery")).toEqual({
      id: `${METRO_NAMESPACE}ghost`,
    });
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
