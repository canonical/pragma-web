// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildStationMark from "./buildStationMark.js";
import { DOT_RADIUS, INTERCHANGE_RADIUS } from "./constants.js";
import type { DiagramStop } from "./types.js";

const STATION: DiagramStop = {
  uri: "urn:station",
  curie: "station",
  title: "Station",
  isInterchange: false,
  position: { x: 1, y: 1 },
};

describe("buildStationMark", () => {
  it("marks a station one track passes with a dot", () => {
    const mark = buildStationMark(STATION, [{ x: 24, y: 24 }], []);
    expect(mark).toMatchObject({
      shape: "dot",
      x: 24 - DOT_RADIUS,
      y: 24 - DOT_RADIUS,
      width: 2 * DOT_RADIUS,
      height: 2 * DOT_RADIUS,
      radius: DOT_RADIUS,
    });
    expect(mark.label.anchor).toBe("start");
  });

  it("marks tracks passing side by side with one capsule around them", () => {
    const mark = buildStationMark(
      STATION,
      [
        { x: 24, y: 21 },
        { x: 24, y: 27 },
      ],
      [{ x: 1, y: 0 }],
    );
    expect(mark).toMatchObject({
      shape: "capsule",
      y: 21 - DOT_RADIUS,
      height: 6 + 2 * DOT_RADIUS,
    });
    expect(mark.label.anchor).toBe("end");
  });

  it("marks an interchange with a larger capsule even at one point", () => {
    const mark = buildStationMark(
      { ...STATION, isInterchange: true },
      [{ x: 24, y: 24 }],
      [],
    );
    expect(mark).toMatchObject({
      shape: "capsule",
      radius: INTERCHANGE_RADIUS,
      width: 2 * INTERCHANGE_RADIUS,
    });
  });

  it("throws for a station no track passes", () => {
    expect(() => buildStationMark(STATION, [], [])).toThrow(/urn:station/);
  });
});
