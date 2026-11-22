import {
  buildSearchVariables,
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { SEARCH_DOOR_CLASSES } from "./constants.js";
import warmSearch from "./warmSearch.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmSearch", () => {
  it("prefetches the search query with the page's variables for the text", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmSearch({}, { q: " but ", type: "ds:Component" });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DocsSearchQuery");
    // Relay adds the operation's defaults for the windows a first page omits.
    expect(variables).toMatchObject(
      buildSearchVariables("but", { type: "ds:Component", page: 1 }),
    );
    expect(variables).toMatchObject({ hasEarlier: false, hasPrevious: false });
  });

  it("prefetches the doors' totals for an address with no text", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmSearch({}, {});

    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("DocsSearchDoorsQuery");
    expect(variables).toEqual(SEARCH_DOOR_CLASSES);
  });
});
