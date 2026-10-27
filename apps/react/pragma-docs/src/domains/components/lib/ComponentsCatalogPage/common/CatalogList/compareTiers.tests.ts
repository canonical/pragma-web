import { describe, expect, it } from "vitest";
import compareTiers from "./compareTiers.js";

const UNTIERED = "Untiered";

describe("compareTiers", () => {
  it("lists the global tier first, untiered last and the rest alphabetically", () => {
    expect(
      ["Sites", UNTIERED, "Apps/LXD", "Global"].sort((a, b) =>
        compareTiers(a, b, UNTIERED),
      ),
    ).toEqual(["Global", "Apps/LXD", "Sites", UNTIERED]);
  });

  it("holds a tier equal to itself", () => {
    expect(compareTiers("Global", "Global", UNTIERED)).toBe(0);
    expect(compareTiers(UNTIERED, UNTIERED, UNTIERED)).toBe(0);
  });

  it("puts untiered after the global tier too", () => {
    expect(compareTiers(UNTIERED, "Global", UNTIERED)).toBeGreaterThan(0);
    expect(compareTiers("Global", UNTIERED, UNTIERED)).toBeLessThan(0);
  });
});
