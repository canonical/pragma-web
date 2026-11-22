import { describe, expect, it } from "vitest";
import compactIri from "../lib/compactIri.js";
import compareCodePoints from "../lib/compareCodePoints.js";
import * as lens from "../lib/lens/index.js";
import * as browser from "./index.js";

describe("the browser entry", () => {
  it("serves the pure helpers the root serves", () => {
    expect(browser.compactIri).toBe(compactIri);
    expect(browser.compareCodePoints).toBe(compareCodePoints);
  });

  it("serves the lens model and nothing that reads the filesystem", () => {
    expect(Object.keys(browser).sort()).toEqual(
      ["compactIri", "compareCodePoints", ...Object.keys(lens)].sort(),
    );
  });
});
