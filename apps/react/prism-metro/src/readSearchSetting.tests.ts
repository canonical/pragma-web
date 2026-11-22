// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { SEARCH_OFF } from "./constants.js";
import readSearchSetting from "./readSearchSetting.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

// `vi.stubEnv` writes Vite's env and the process env together, the pair the
// setting is read from.
describe("readSearchSetting", () => {
  it("reads PRISM_SEARCH from the environment", () => {
    vi.stubEnv("PRISM_SEARCH", SEARCH_OFF);
    expect(readSearchSetting()).toBe(SEARCH_OFF);
  });

  it("reads nothing when PRISM_SEARCH is not set", () => {
    vi.stubEnv("PRISM_SEARCH", undefined);
    expect(readSearchSetting()).toBeUndefined();
  });
});
