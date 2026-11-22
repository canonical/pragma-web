import { describe, expect, it } from "vitest";
import * as browser from "./browser.js";
import compactIri from "./lib/compactIri.js";
import compareCodePoints from "./lib/compareCodePoints.js";

describe("the browser entry", () => {
  it("serves the pure helpers the root serves", () => {
    expect(browser.compactIri).toBe(compactIri);
    expect(browser.compareCodePoints).toBe(compareCodePoints);
  });

  it("imports nothing that reads the filesystem", () => {
    expect(Object.keys(browser).sort()).toEqual([
      "compactIri",
      "compareCodePoints",
    ]);
  });
});
