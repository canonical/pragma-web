import { describe, expect, it } from "vitest";
import createEnvironment from "./createEnvironment.js";
import {
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "./prefetchEnvironment.js";

describe("setPrefetchEnvironment", () => {
  it("publishes an environment that getPrefetchEnvironment reads back", () => {
    const environment = createEnvironment({
      fetchFn: () => new Promise<never>(() => {}),
    });
    setPrefetchEnvironment(environment);
    expect(getPrefetchEnvironment()).toBe(environment);
    setPrefetchEnvironment(undefined);
  });

  it("clears the slot with undefined", () => {
    setPrefetchEnvironment(
      createEnvironment({ fetchFn: () => new Promise<never>(() => {}) }),
    );
    setPrefetchEnvironment(undefined);
    expect(getPrefetchEnvironment()).toBeUndefined();
  });
});

describe("getPrefetchEnvironment", () => {
  it("reads undefined while nothing is published", () => {
    expect(getPrefetchEnvironment()).toBeUndefined();
  });
});
