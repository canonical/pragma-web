import { describe, expect, it } from "vitest";
import readColumnRegistry from "./readColumnRegistry.js";

describe("readColumnRegistry", () => {
  it("answers the same map on every call", () => {
    expect(readColumnRegistry()).toBe(readColumnRegistry());
    expect(readColumnRegistry()).toBeInstanceOf(WeakMap);
  });
});
