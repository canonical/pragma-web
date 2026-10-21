import { afterEach, describe, expect, it } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { componentProbeVariables } from "./probeQuery.js";
import warmPlayground from "./warmPlayground.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmPlayground", () => {
  it("prefetches the probe query with the probe's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmPlayground();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("ComponentProbeQuery");
    expect(variables).toEqual(componentProbeVariables());
  });
});
