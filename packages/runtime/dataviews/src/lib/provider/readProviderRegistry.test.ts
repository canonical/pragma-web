import { describe, expect, it } from "vitest";
import readProviderRegistry from "./readProviderRegistry.js";

describe("readProviderRegistry", () => {
  it("reads one weak registry, keyed by object", () => {
    const registry = readProviderRegistry();
    expect(registry).toBeInstanceOf(WeakMap);
    expect(readProviderRegistry()).toBe(registry);
    expect(registry.has({})).toBe(false);
  });
});
