import { afterEach, describe, expect, it } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import { definitionsExplorerVariables } from "./definitionsQuery.js";
import warmDefinitions from "./warmDefinitions.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmDefinitions", () => {
  it("prefetches the explorer with the selected term on /definitions/:term", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmDefinitions({ term: "ds:UIBlock" });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DefinitionsExplorerQuery");
    expect(variables).toEqual(definitionsExplorerVariables("ds:UIBlock"));
  });

  it("prefetches the term-less explorer on /definitions", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmDefinitions({});

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DefinitionsExplorerQuery");
    expect(variables).toEqual(definitionsExplorerVariables(undefined));
  });
});
