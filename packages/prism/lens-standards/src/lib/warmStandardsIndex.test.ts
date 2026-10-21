import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import { STANDARDS_BINDING_FIXTURE } from "../../testing/fixtures.js";
import { buildStandardsIndexVariables } from "./standardsIndexQuery.js";
import warmStandardsIndex from "./warmStandardsIndex.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmStandardsIndex", () => {
  it("prefetches the index query with the binding's class", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmStandardsIndex(STANDARDS_BINDING_FIXTURE);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("StandardsIndexQuery");
    expect(variables).toEqual(
      buildStandardsIndexVariables(STANDARDS_BINDING_FIXTURE.classUri),
    );
  });
});
