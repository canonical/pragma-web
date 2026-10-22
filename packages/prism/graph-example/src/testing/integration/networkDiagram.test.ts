// =============================================================================
// The schematic network diagram, as a client reads it through GraphQL. The
// conventions a drawing builds on are checked here rather than trusted:
//
//   - exactly the stations a route calls at have a position;
//   - every segment between consecutive calls, and the closing segment of a
//     loop, is horizontal, vertical or diagonal;
//   - no two stations share a point, and no segment runs over a station it
//     does not call at;
//   - the network is anchored at x = 0 and y = 0.
// =============================================================================

import { beforeAll, describe, expect, it } from "vitest";
import { BARE_STATION_URIS } from "../fixtures.js";
import { readNetwork } from "../readNetwork.js";
import type { Network, NetworkPoint, NetworkRoute } from "../types.js";

let network: Network;

beforeAll(async () => {
  network = await readNetwork();
});

/** A segment of a route, between two consecutive calls. */
interface Segment {
  readonly label: string;
  readonly from: NetworkPoint;
  readonly to: NetworkPoint;
}

/** A point as one string, so points can be compared in a set. */
const formatPoint = (point: NetworkPoint): string => `${point.x},${point.y}`;

/** The position of every call on a route, failing the test on a missing one. */
const listPoints = (route: NetworkRoute): NetworkPoint[] =>
  route.calls.map((call) => {
    expect(call.stop.diagramPosition, call.stop.uri).not.toBeNull();
    return call.stop.diagramPosition as NetworkPoint;
  });

/** The segments of a route, the closing one of a loop included. */
const listSegments = (route: NetworkRoute): Segment[] => {
  const points = listPoints(route);
  const ends = route.isLoop ? points : points.slice(0, -1);
  return ends.map((from, index) => ({
    label: `${route.label} ${index + 1}`,
    from,
    to: points.at((index + 1) % points.length) as NetworkPoint,
  }));
};

/** Every segment of every route of every line. */
const listAllSegments = (): Segment[] =>
  network.lines.flatMap((line) => line.routes.flatMap(listSegments));

/** Is the segment horizontal, vertical or at 45 degrees? */
const isOctilinear = ({ from, to }: Segment): boolean => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return dx === 0 || dy === 0 || dx === dy;
};

/**
 * The lattice points strictly between a segment's ends, stepping by the sign
 * of each axis. Only meaningful for an octilinear segment, where every step
 * lands on a whole grid point of the segment.
 */
const listInteriorPoints = ({ from, to }: Segment): NetworkPoint[] => {
  const stepX = Math.sign(to.x - from.x);
  const stepY = Math.sign(to.y - from.y);
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
  return Array.from({ length: Math.max(steps - 1, 0) }, (_, index) => ({
    x: from.x + stepX * (index + 1),
    y: from.y + stepY * (index + 1),
  }));
};

describe("the network diagram", () => {
  it("positions exactly the stations a route calls at", () => {
    const called = new Set(
      network.lines.flatMap((line) =>
        line.routes.flatMap((route) =>
          route.calls.map((call) => call.stop.uri),
        ),
      ),
    );
    for (const station of network.stations) {
      expect(station.diagramPosition !== null, station.uri).toBe(
        called.has(station.uri),
      );
    }
  });

  it("leaves both bare stations without a position", () => {
    for (const uri of BARE_STATION_URIS) {
      const station = network.stations.find(
        (candidate) => candidate.uri === uri,
      );
      expect(station, uri).toBeDefined();
      expect(station?.diagramPosition, uri).toBeNull();
    }
  });

  it("draws every segment, a loop's closing one included, octilinear", () => {
    const segments = listAllSegments();
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(formatPoint(segment.from), segment.label).not.toBe(
        formatPoint(segment.to),
      );
      expect(isOctilinear(segment), segment.label).toBe(true);
    }
  });

  it("puts no two stations on one point", () => {
    const points = network.stations.flatMap((station) =>
      station.diagramPosition === null
        ? []
        : [formatPoint(station.diagramPosition)],
    );
    expect(new Set(points).size).toBe(points.length);
  });

  it("runs no segment over a station it does not call at", () => {
    const occupied = new Set(
      network.stations.flatMap((station) =>
        station.diagramPosition === null
          ? []
          : [formatPoint(station.diagramPosition)],
      ),
    );
    for (const segment of listAllSegments()) {
      const crossed = listInteriorPoints(segment)
        .map(formatPoint)
        .filter((point) => occupied.has(point));
      expect(crossed, segment.label).toEqual([]);
    }
  });

  it("anchors the network at x = 0 and y = 0", () => {
    const points = network.stations.flatMap((station) =>
      station.diagramPosition === null ? [] : [station.diagramPosition],
    );
    expect(Math.min(...points.map((point) => point.x))).toBe(0);
    expect(Math.min(...points.map((point) => point.y))).toBe(0);
  });
});
