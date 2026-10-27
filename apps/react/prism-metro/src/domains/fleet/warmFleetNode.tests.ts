import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import formationPageQueryNode from "#relay/__generated__/FormationPageQuery.graphql.js";
import createMetroFetch from "../../../testing/createMetroFetch.js";
import {
  SERIES_90_SIX_CAR_CURIE,
  SERIES_90_SIX_CAR_IRI,
} from "../../../testing/fixtures.js";
import warmFleetNode from "./warmFleetNode.js";

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
    return warmFleetNode(formationPageQueryNode, params);
  } finally {
    setPrefetchEnvironment(undefined);
  }
};

describe("warmFleetNode", () => {
  it("resolves with no request when no environment is published", async () => {
    await expect(
      warmFleetNode(formationPageQueryNode, { uri: SERIES_90_SIX_CAR_CURIE }),
    ).resolves.toBeUndefined();
  });

  it("throws on params with no address, before reading the slot", () => {
    expect(() => warmFleetNode(formationPageQueryNode, {})).toThrow(
      /non-empty string/,
    );
  });

  it("expands the compact address, then fetches the page's operation", async () => {
    const fetchFn = createMetroFetch();

    await warmLikeTheServer(createEnvironment({ fetchFn }), {
      uri: SERIES_90_SIX_CAR_CURIE,
    });

    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "FleetNamespacesQuery",
      "FormationPageQuery",
    ]);
    expect(fetchFn.mock.lastCall?.at(1)).toEqual({ id: SERIES_90_SIX_CAR_IRI });
  });

  it("makes no request when the store already holds both operations", async () => {
    const fetchFn = createMetroFetch();
    const environment = createEnvironment({ fetchFn });
    await warmLikeTheServer(environment, { uri: SERIES_90_SIX_CAR_CURIE });
    fetchFn.mockClear();

    await warmLikeTheServer(environment, { uri: SERIES_90_SIX_CAR_CURIE });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("sends an absolute IRI through unchanged", async () => {
    const fetchFn = createMetroFetch();
    await warmLikeTheServer(createEnvironment({ fetchFn }), {
      uri: SERIES_90_SIX_CAR_IRI,
    });
    expect(fetchFn.mock.lastCall?.at(1)).toEqual({ id: SERIES_90_SIX_CAR_IRI });
  });

  it("rejects with the first fetch's error", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("graph down"));
    await expect(
      warmLikeTheServer(createEnvironment({ fetchFn }), {
        uri: SERIES_90_SIX_CAR_CURIE,
      }),
    ).rejects.toThrow("graph down");
  });
});
