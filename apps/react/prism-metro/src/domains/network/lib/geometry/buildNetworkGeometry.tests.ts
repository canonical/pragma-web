// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../../testing/buildNetworkLines.js";
import {
  LINE_COUNT,
  ROUTED_STATION_COUNT,
} from "../../../../../testing/fixtures.js";
import buildNetworkGeometry from "./buildNetworkGeometry.js";
import { GRID_UNIT } from "./constants.js";
import type { Box, StationMark, Track } from "./types.js";

/** Whether two boxes overlap. */
const isOverlapping = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

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

  it("places no name over another name or another station's mark", () => {
    for (const mark of geometry.marks) {
      for (const other of geometry.marks.filter((each) => each !== mark)) {
        expect(isOverlapping(mark.label.box, other)).toBe(false);
        expect(isOverlapping(mark.label.box, other.label.box)).toBe(false);
      }
    }
  });

  it("sits every station and every name's anchor on a lattice dot", () => {
    for (const mark of geometry.marks) {
      expect((mark.x + mark.width / 2) % GRID_UNIT).toBeCloseTo(0);
      expect((mark.y + mark.height / 2) % GRID_UNIT).toBeCloseTo(0);
      expect(Math.abs(mark.label.x % GRID_UNIT)).toBe(0);
      expect(Math.abs(mark.label.y % GRID_UNIT)).toBe(0);
    }
  });

  it("places every name the same way each time", () => {
    expect(buildNetworkGeometry(buildNetworkLines())).toEqual(geometry);
  });

  it("fits the viewBox around every mark and name", () => {
    const { x: minX, y: minY, width, height } = geometry.viewBox;
    for (const mark of [
      ...geometry.marks,
      ...geometry.marks.map((each) => each.label.box),
    ]) {
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
