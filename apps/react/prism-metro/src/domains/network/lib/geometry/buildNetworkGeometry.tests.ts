// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../../testing/buildNetworkLines.js";
import {
  LINE_COUNT,
  ROUTED_STATION_COUNT,
} from "../../../../../testing/fixtures.js";
import buildNetworkGeometry from "./buildNetworkGeometry.js";
import type { StationMark, Track } from "./types.js";

const geometry = buildNetworkGeometry(buildNetworkLines());

/** The mark of the station titled `title`. */
const findMark = (title: string): StationMark =>
  geometry.marks.find((mark) => mark.stop.title === title) as StationMark;

/** The track of the line titled `title`. */
const findTrack = (title: string): Track =>
  geometry.tracks.find((track) => track.lineTitle === title) as Track;

describe("buildNetworkGeometry", () => {
  it("draws one track per line, a route and its reverse being one track", () => {
    expect(geometry.tracks).toHaveLength(LINE_COUNT);
    expect(findTrack("Circle Line").routeLabel).toBe("Clockwise");
    expect(findTrack("North Line").colour).toBe("#c8102e");
  });

  it("closes the loops and leaves the linear lines open", () => {
    expect(findTrack("Circle Line").path.endsWith(" Z")).toBe(true);
    expect(findTrack("Ringway Clockwise").path.endsWith(" Z")).toBe(true);
    expect(findTrack("North Line").path.endsWith(" Z")).toBe(false);
  });

  it("draws the two Ringway lines as two parallel tracks", () => {
    expect(findTrack("Ringway Clockwise").path).not.toBe(
      findTrack("Ringway Anticlockwise").path,
    );
    expect(findMark("Fernside").shape).toBe("capsule");
  });

  it("marks every routed station once", () => {
    expect(geometry.marks).toHaveLength(ROUTED_STATION_COUNT);
    expect(new Set(geometry.marks.map((mark) => mark.stop.uri)).size).toBe(
      ROUTED_STATION_COUNT,
    );
  });

  it("marks plain stations with dots and interchanges with capsules", () => {
    expect(findMark("Northgate").shape).toBe("dot");
    for (const mark of geometry.marks.filter(
      (each) => each.stop.isInterchange,
    )) {
      expect(mark.shape).toBe("capsule");
    }
  });

  it("fits the viewBox around the drawing", () => {
    const [minX, minY, width, height] = geometry.viewBox.split(" ").map(Number);
    for (const mark of geometry.marks) {
      expect(mark.x).toBeGreaterThanOrEqual(minX as number);
      expect(mark.y).toBeGreaterThanOrEqual(minY as number);
      expect(mark.x + mark.width).toBeLessThanOrEqual(
        (minX as number) + (width as number),
      );
      expect(mark.y + mark.height).toBeLessThanOrEqual(
        (minY as number) + (height as number),
      );
    }
  });

  it("throws when there is no line to draw", () => {
    expect(() => buildNetworkGeometry([])).toThrow(/empty drawing/);
  });
});
