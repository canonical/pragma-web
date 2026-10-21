import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import { UIBLOCK_TERM } from "../../testing/fixtures.js";
import { buildDefinitionsExplorerVariables } from "./definitionsQuery.js";
import warmDefinitions from "./warmDefinitions.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmDefinitions", () => {
  it("prefetches the explorer with the selected term on /definitions/:term", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmDefinitions({ term: UIBLOCK_TERM });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DefinitionsExplorerQuery");
    expect(variables).toEqual(buildDefinitionsExplorerVariables(UIBLOCK_TERM));
  });

  it("prefetches the term-less explorer on /definitions", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmDefinitions({});

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DefinitionsExplorerQuery");
    expect(variables).toEqual(buildDefinitionsExplorerVariables(undefined));
  });
});
