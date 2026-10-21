import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import createMetroFetch from "../../testing/createMetroFetch.js";
import {
  NORTHGATE_CURIE,
  NORTHGATE_IRI,
  STATIONS_BINDING,
} from "../../testing/fixtures.js";
import warmEntity from "./warmEntity.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

/** Publish `environment`, start the warm, and clear the slot again before
 * anything is awaited, as the server's prepare step does. */
const warmLikeTheServer = (
  environment: ReturnType<typeof createEnvironment>,
  params: Readonly<Record<string, unknown>>,
): Promise<void> => {
  setPrefetchEnvironment(environment);
  try {
    return warmEntity(STATIONS_BINDING, params);
  } finally {
    setPrefetchEnvironment(undefined);
  }
};

describe("warmEntity", () => {
  it("resolves with no request when no environment is published", async () => {
    await expect(
      warmEntity(STATIONS_BINDING, { uri: NORTHGATE_CURIE }),
    ).resolves.toBeUndefined();
  });

  it("throws on params with no address, before reading the slot", () => {
    expect(() => warmEntity(STATIONS_BINDING, {})).toThrow(/non-empty string/);
  });

  it("runs both steps against the environment it read when called", async () => {
    const fetchFn = createMetroFetch();
    const environment = createEnvironment({ fetchFn });

    await warmLikeTheServer(environment, { uri: NORTHGATE_CURIE });

    // The slot was empty long before the namespaces arrived, and the page's
    // request still went out, through the environment captured at the call.
    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "EntityNamespacesQuery",
      "EntityPageQuery",
    ]);
    expect(fetchFn.mock.lastCall?.at(1)).toEqual({
      id: NORTHGATE_IRI,
      classUri: "metro:Station",
    });
  });

  it("makes no request when the store already holds both operations", async () => {
    const fetchFn = createMetroFetch();
    const environment = createEnvironment({ fetchFn });
    await warmLikeTheServer(environment, { uri: NORTHGATE_CURIE });
    fetchFn.mockClear();

    await warmLikeTheServer(environment, { uri: NORTHGATE_CURIE });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("sends an absolute IRI through unchanged", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), {
      uri: NORTHGATE_IRI,
    });
    expect(fetchFn.mock.lastCall?.at(1)).toEqual({
      id: NORTHGATE_IRI,
      classUri: "metro:Station",
    });
  });

  it("rejects with the first fetch's error", async () => {
    const fetchFn = createFetchSpy();
    fetchFn.mockRejectedValue(new Error("graph down"));
    await expect(
      warmLikeTheServer(createEnvironment({ fetchFn }), {
        uri: NORTHGATE_CURIE,
      }),
    ).rejects.toThrow("graph down");
  });
});
