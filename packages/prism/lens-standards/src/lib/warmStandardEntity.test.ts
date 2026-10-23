import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import {
  LINK_COMPONENT_URI,
  STANDARDS_BINDING_FIXTURE,
} from "../../testing/fixtures.js";
import { buildStandardEntityVariables } from "./standardEntityQuery.js";
import warmStandardEntity from "./warmStandardEntity.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmStandardEntity", () => {
  it("prefetches the entity query with the binding's class and the param", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmStandardEntity(STANDARDS_BINDING_FIXTURE, {
      uri: LINK_COMPONENT_URI,
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("StandardEntityQuery");
    expect(variables).toEqual(
      buildStandardEntityVariables(
        STANDARDS_BINDING_FIXTURE.classUri,
        LINK_COMPONENT_URI,
      ),
    );
  });

  it("refuses params with no address before fetching", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    expect(() => warmStandardEntity(STANDARDS_BINDING_FIXTURE, {})).toThrow(
      /non-empty string/,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
