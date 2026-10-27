import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createMetroFetch from "../../../testing/createMetroFetch.js";
import { FLEET_CLASS_URI, FLEET_PAGE_SIZE } from "./constants.js";
import warmFleetIndex from "./warmFleetIndex.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmFleetIndex", () => {
  it("resolves with no request when no environment is published", async () => {
    await expect(warmFleetIndex()).resolves.toBeUndefined();
  });

  it("prefetches the index's operation for the rolling stock class", async () => {
    const fetchFn = createMetroFetch();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    await warmFleetIndex();

    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "FleetIndexQuery",
    ]);
    expect(fetchFn.mock.lastCall?.at(1)).toEqual({
      classUri: FLEET_CLASS_URI,
      count: FLEET_PAGE_SIZE,
    });
  });
});
