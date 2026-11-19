import { viewSearch } from "@canonical/prism-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import entitySearch from "./entitySearch.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("entitySearch", () => {
  it("keeps the view's parameters and the facet parameters", () => {
    expect(
      entitySearch["~standard"].validate({
        q: "bank",
        servesLine: "metro:circle-line",
        inZone: "",
      }),
    ).toEqual({ value: { q: "bank", servesLine: "metro:circle-line" } });
  });

  it("passes on the issues core's view search finds", () => {
    const failure = { issues: [{ message: "unreadable" }] };
    vi.spyOn(viewSearch["~standard"], "validate").mockReturnValue(failure);
    expect(entitySearch["~standard"].validate({ q: 1 })).toBe(failure);
  });

  it("passes on a pending answer of core's view search", () => {
    const pending = Promise.resolve({ value: {} });
    vi.spyOn(viewSearch["~standard"], "validate").mockReturnValue(pending);
    expect(entitySearch["~standard"].validate({})).toBe(pending);
  });
});
