// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildMarkBox from "./buildMarkBox.js";
import { DOT_RADIUS, GRID_UNIT, INTERCHANGE_RADIUS } from "./constants.js";
import type { DiagramStop } from "./types.js";

/** A station on the lattice dot (16, 16). */
const STATION: DiagramStop = {
  uri: "urn:station",
  curie: "station",
  title: "Station",
  isInterchange: false,
  position: { x: 1, y: 1 },
};

describe("buildMarkBox", () => {
  it("marks a station one track passes with a dot on its lattice point", () => {
    expect(buildMarkBox(STATION, [{ x: GRID_UNIT, y: GRID_UNIT }])).toEqual({
      stop: STATION,
      shape: "dot",
      x: GRID_UNIT - DOT_RADIUS,
      y: GRID_UNIT - DOT_RADIUS,
      width: 2 * DOT_RADIUS,
      height: 2 * DOT_RADIUS,
      radius: DOT_RADIUS,
    });
  });

  it("marks tracks passing side by side with one capsule around them", () => {
    expect(
      buildMarkBox(STATION, [
        { x: 16, y: 13 },
        { x: 16, y: 19 },
      ]),
    ).toMatchObject({
      shape: "capsule",
      y: 13 - DOT_RADIUS,
      height: 6 + 2 * DOT_RADIUS,
    });
  });

  it("centres a capsule on its station's dot, as far as its furthest track", () => {
    const mark = buildMarkBox(STATION, [
      { x: 16, y: 16 },
      { x: 16, y: 22 },
    ]);
    expect(mark.y + mark.height / 2).toBe(16);
    expect(mark.height).toBe(12 + 2 * DOT_RADIUS);
  });

  it("marks an interchange with a larger capsule even at one point", () => {
    expect(
      buildMarkBox({ ...STATION, isInterchange: true }, [{ x: 16, y: 16 }]),
    ).toMatchObject({
      shape: "capsule",
      radius: INTERCHANGE_RADIUS,
      width: 2 * INTERCHANGE_RADIUS,
    });
  });

  it("throws for a station no track passes", () => {
    expect(() => buildMarkBox(STATION, [])).toThrow(/urn:station/);
  });
});
