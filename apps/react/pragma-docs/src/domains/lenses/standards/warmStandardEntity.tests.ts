import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import { STANDARD_URI } from "../../../../testing/fixtures.js";
import { standardEntityVariables } from "./standardEntityQuery.js";
import warmStandardEntity from "./warmStandardEntity.js";

const SAFE_ACCESS = { uri: STANDARD_URI };

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmStandardEntity", () => {
  it("prefetches the entity query with the reading page's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmStandardEntity(SAFE_ACCESS);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("StandardEntityQuery");
    expect(variables).toEqual(standardEntityVariables(SAFE_ACCESS));
  });
});
