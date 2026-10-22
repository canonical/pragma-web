// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PORT } from "./constants.js";
import resolvePort from "./resolvePort.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolvePort", () => {
  it("reads a numeric PORT", () => {
    vi.stubEnv("PORT", "6178");
    expect(resolvePort()).toBe(6178);
  });

  it("falls back to the default port when PORT is unset", () => {
    vi.stubEnv("PORT", undefined);
    expect(resolvePort()).toBe(DEFAULT_PORT);
  });

  it("treats an empty PORT as unset", () => {
    vi.stubEnv("PORT", "");
    expect(resolvePort()).toBe(DEFAULT_PORT);
  });

  it("treats a non-numeric PORT as unset", () => {
    vi.stubEnv("PORT", "abc");
    expect(resolvePort()).toBe(DEFAULT_PORT);
  });
});
