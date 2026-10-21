import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { componentEntityVariables } from "./entityQuery.js";
import warmComponentEntity from "./warmComponentEntity.js";

const BUTTON = { uri: "ds:global.component.button" };

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmComponentEntity", () => {
  it("prefetches the entity query with the entity page's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmComponentEntity(BUTTON);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("ComponentEntityQuery");
    expect(variables).toEqual(componentEntityVariables(BUTTON));
  });
});
