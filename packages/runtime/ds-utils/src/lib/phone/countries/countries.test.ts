import { describe, expect, it } from "vitest";
import countries from "./countries.js";
import masks from "./masks.js";

const isoCode = /^[A-Z]{2}$/;
const dialCode = /^\+\d{1,4}$/;
const maskShape = /^[#0-9 ,.:()/+*?-]+$/;

describe("phoneCountries", () => {
  it("contains the complete ISO country set with unique codes", () => {
    expect(countries.length).toBeGreaterThanOrEqual(240);
    const codes = countries.map(({ code }) => code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) expect(code).toMatch(isoCode);
  });

  it("gives every country a name and a dial code", () => {
    for (const country of countries) {
      expect(country.name.trim().length).toBeGreaterThan(0);
      expect(country.dialCode).toMatch(dialCode);
    }
  });

  it("uses a digit-bearing display mask when one is present", () => {
    for (const country of countries) {
      if (!country.format) continue;
      expect(country.format).toMatch(maskShape);
      expect(country.format).toContain("#");
    }
  });

  it("includes the reference countries used by phone consumers", () => {
    expect(countries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "GB", dialCode: "+44" }),
        expect.objectContaining({ code: "US", dialCode: "+1" }),
      ]),
    );
  });
});

describe("phoneMasks", () => {
  it("defines a nonempty digit mask for every key", () => {
    expect(Object.keys(masks).length).toBeGreaterThan(0);
    for (const mask of Object.values(masks)) {
      expect(mask).toMatch(maskShape);
      expect(mask).toContain("#");
    }
  });
});
