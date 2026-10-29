import { describe, expect, it } from "vitest";
import {
  NORTH_LINE_PLATFORMS,
  PARTLY_MEASURED_LINE,
  UNMEASURED_LINE,
} from "../../../../testing/fixtures.js";
import measurePlatformFit from "./measurePlatformFit.js";

describe("measurePlatformFit", () => {
  it("finds the six-car overhanging Marsh End by 20 m on the North Line", () => {
    const [fit] = measurePlatformFit(120000, [NORTH_LINE_PLATFORMS]);
    expect(fit).toEqual({
      title: "North Line",
      code: "1",
      shortest: 100000,
      overhangs: [
        { title: "Marsh End", platformLength: 100000, excess: 20000 },
      ],
    });
  });

  it("finds no overhang for a train that fits every platform", () => {
    const [fit] = measurePlatformFit(60000, [NORTH_LINE_PLATFORMS]);
    expect(fit?.overhangs).toEqual([]);
    expect(fit?.shortest).toBe(100000);
  });

  it("counts a train exactly as long as a platform as fitting it", () => {
    const [fit] = measurePlatformFit(100000, [NORTH_LINE_PLATFORMS]);
    expect(fit?.overhangs).toEqual([]);
  });

  it("orders overhangs by excess, largest first, then by title", () => {
    const [fit] = measurePlatformFit(130000, [NORTH_LINE_PLATFORMS]);
    expect(fit?.overhangs.map(({ title, excess }) => [title, excess])).toEqual([
      ["Marsh End", 30000],
      ["Foundry Row", 5000],
      ["Northgate", 5000],
      ["Verge Park", 5000],
    ]);
  });

  it("skips a stop whose platform length is unknown", () => {
    const [fit] = measurePlatformFit(80000, [PARTLY_MEASURED_LINE]);
    expect(fit?.shortest).toBe(70000);
    expect(fit?.overhangs.map(({ title }) => title)).toEqual([
      "Alpha",
      "Gamma",
    ]);
  });

  it("knows no shortest platform on a line with no measured stop", () => {
    const [fit] = measurePlatformFit(80000, [UNMEASURED_LINE]);
    expect(fit).toEqual({
      title: "Unmeasured Line",
      code: "U",
      shortest: null,
      overhangs: [],
    });
  });

  it("measures one fit per line, in the order the lines are given", () => {
    const fits = measurePlatformFit(80000, [
      UNMEASURED_LINE,
      NORTH_LINE_PLATFORMS,
    ]);
    expect(fits.map(({ code }) => code)).toEqual(["U", "1"]);
  });
});
