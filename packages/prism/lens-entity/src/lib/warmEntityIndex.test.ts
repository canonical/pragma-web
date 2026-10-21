import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import { STATIONS_BINDING } from "../../testing/fixtures.js";
import { buildEntityIndexVariables } from "./entityIndexQuery.js";
import warmEntityIndex from "./warmEntityIndex.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmEntityIndex", () => {
  it("prefetches the index's operation with the builder's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmEntityIndex(STATIONS_BINDING);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("EntityIndexQuery");
    expect(variables).toEqual(buildEntityIndexVariables(STATIONS_BINDING));
  });

  it("fetches nothing when no environment is published", async () => {
    await expect(warmEntityIndex(STATIONS_BINDING)).resolves.toBeUndefined();
  });
});
