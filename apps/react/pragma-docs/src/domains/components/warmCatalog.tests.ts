import { afterEach, describe, expect, it } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { componentsCatalogVariables } from "./catalogQuery.js";
import warmCatalog from "./warmCatalog.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmCatalog", () => {
  it("prefetches the catalog query with the catalog page's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmCatalog();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("ComponentsCatalogQuery");
    expect(variables).toEqual(componentsCatalogVariables());
  });
});
