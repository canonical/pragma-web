// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildMarkBox from "./buildMarkBox.js";
import { DOT_RADIUS, INTERCHANGE_RADIUS } from "./constants.js";
import type { DiagramStop } from "./types.js";

const STATION: DiagramStop = {
  uri: "urn:station",
  curie: "station",
  title: "Station",
  isInterchange: false,
  position: { x: 1, y: 1 },
};

describe("buildMarkBox", () => {
  it("marks a station one track passes with a dot", () => {
    expect(buildMarkBox(STATION, [{ x: 24, y: 24 }])).toEqual({
      stop: STATION,
      shape: "dot",
      x: 24 - DOT_RADIUS,
      y: 24 - DOT_RADIUS,
      width: 2 * DOT_RADIUS,
      height: 2 * DOT_RADIUS,
      radius: DOT_RADIUS,
    });
  });

  it("marks tracks passing side by side with one capsule around them", () => {
    expect(
      buildMarkBox(STATION, [
        { x: 24, y: 21 },
        { x: 24, y: 27 },
      ]),
    ).toMatchObject({
      shape: "capsule",
      y: 21 - DOT_RADIUS,
      height: 6 + 2 * DOT_RADIUS,
    });
  });

  it("marks an interchange with a larger capsule even at one point", () => {
    expect(
      buildMarkBox({ ...STATION, isInterchange: true }, [{ x: 24, y: 24 }]),
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
