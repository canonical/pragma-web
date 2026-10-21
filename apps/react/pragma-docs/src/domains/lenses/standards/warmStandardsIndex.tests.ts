import { afterEach, describe, expect, it } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import { standardsIndexVariables } from "./standardsIndexQuery.js";
import warmStandardsIndex from "./warmStandardsIndex.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmStandardsIndex", () => {
  it("prefetches the index query with the index page's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmStandardsIndex();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("StandardsIndexQuery");
    expect(variables).toEqual(standardsIndexVariables());
  });
});
