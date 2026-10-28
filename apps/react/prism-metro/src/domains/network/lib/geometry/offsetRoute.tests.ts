// @vitest-environment node

import { describe, expect, it } from "vitest";
import { GRID_UNIT } from "./constants.js";
import offsetRoute from "./offsetRoute.js";
import type { DiagramRoute, DiagramStop, DrawingPoint } from "./types.js";

/** A stop named `name` at grid point (`x`, `y`). */
const makeStop = (name: string, x: number, y: number): DiagramStop => ({
  uri: `urn:${name}`,
  curie: name,
  title: name,
  isInterchange: false,
  position: { x, y },
});

const A = makeStop("a", 0, 0);
const B = makeStop("b", 2, 0);
const C = makeStop("c", 4, 2);
const D = makeStop("d", 2, 4);

/** A route over `stops`. */
const makeRoute = (
  stops: readonly DiagramStop[],
  isLoop = false,
): DiagramRoute => ({ label: "route", isLoop, reverseLabel: null, stops });

/** Every segment `stops` run over, offset `offset` for line `urn:line`. */
const offsetEvery = (
  pairs: readonly [DiagramStop, DiagramStop][],
  offset: number,
): ReadonlyMap<string, ReadonlyMap<string, number>> =>
  new Map(
    pairs.map(([a, b]) => [
      [a.uri, b.uri].sort().join(" "),
      new Map([["urn:line", offset]]),
    ]),
  );

/** The distance from `point` to the line through `from` towards `direction`. */
const measureDistance = (
  point: DrawingPoint,
  from: DrawingPoint,
  direction: DrawingPoint,
): number => {
  const length = Math.hypot(direction.x, direction.y);
  return (
    Math.abs(
      (point.x - from.x) * direction.y - (point.y - from.y) * direction.x,
    ) / length
  );
};

describe("offsetRoute", () => {
  it("draws a centred route on its stops' grid points", () => {
    const { points, closed, stops } = offsetRoute(
      makeRoute([A, B, C]),
      "urn:line",
      offsetEvery(
        [
          [A, B],
          [B, C],
        ],
        0,
      ),
    );
    expect(closed).toBe(false);
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 2 * GRID_UNIT, y: 0 },
      { x: 4 * GRID_UNIT, y: 2 * GRID_UNIT },
    ]);
    expect(stops.get(C.uri)).toEqual({ x: 4 * GRID_UNIT, y: 2 * GRID_UNIT });
  });

  it("keeps a line on one side of a stretch whichever way it runs", () => {
    const offsets = offsetEvery([[A, B]], 3);
    const east = offsetRoute(makeRoute([A, B]), "urn:line", offsets);
    const west = offsetRoute(makeRoute([B, A]), "urn:line", offsets);
    expect(east.points).toEqual([
      { x: 0, y: 3 },
      { x: 2 * GRID_UNIT, y: 3 },
    ]);
    expect(west.stops.get(A.uri)).toEqual(east.stops.get(A.uri));
    expect(west.stops.get(B.uri)).toEqual(east.stops.get(B.uri));
  });

  it("mitres a turn so the track keeps its offset from both legs", () => {
    const { points } = offsetRoute(
      makeRoute([A, B, C]),
      "urn:line",
      offsetEvery(
        [
          [A, B],
          [B, C],
        ],
        3,
      ),
    );
    const turn = points.at(1) as DrawingPoint;
    const corner = { x: 2 * GRID_UNIT, y: 0 };
    expect(measureDistance(turn, corner, { x: 1, y: 0 })).toBeCloseTo(3);
    expect(measureDistance(turn, corner, { x: 1, y: 1 })).toBeCloseTo(3);
  });

  it("averages the offsets where a line joins a shared stretch", () => {
    const offsets = new Map([
      [`${A.uri} ${B.uri}`, new Map([["urn:line", 0]])],
      [`${B.uri} ${C.uri}`, new Map([["urn:line", 6]])],
    ]);
    const { points } = offsetRoute(makeRoute([A, B, C]), "urn:line", offsets);
    const halfDiagonal = 6 / Math.SQRT2 / 2;
    expect(points.at(1)?.x).toBeCloseTo(2 * GRID_UNIT - halfDiagonal);
    expect(points.at(1)?.y).toBeCloseTo(halfDiagonal);
  });

  it("closes a loop through its first stop, with no open end", () => {
    const loop = makeRoute([A, C, D], true);
    const { points, closed, stops, directions } = offsetRoute(
      loop,
      "urn:line",
      offsetEvery(
        [
          [A, C],
          [C, D],
          [D, A],
        ],
        0,
      ),
    );
    // A to C and D to A each bend once, so the loop has five legs, and a
    // closed track has one vertex per leg.
    expect(closed).toBe(true);
    expect(points).toHaveLength(5);
    expect([...stops.keys()].sort()).toEqual([A.uri, C.uri, D.uri]);
    expect(directions.get(A.uri)).toHaveLength(2);
  });

  it("places a bend between stops but no stop on it", () => {
    const { points, stops, directions } = offsetRoute(
      makeRoute([A, C]),
      "urn:line",
      offsetEvery([[A, C]], 0),
    );
    expect(points).toHaveLength(3);
    expect(stops.size).toBe(2);
    expect(directions.get(A.uri)).toHaveLength(1);
    expect(directions.get(C.uri)?.at(0)?.x).toBe(-1);
  });

  it("throws on a route with one stop", () => {
    expect(() => offsetRoute(makeRoute([A]), "urn:line", new Map())).toThrow(
      /needs two stops/,
    );
  });

  it("throws on a segment with no offset for the line", () => {
    expect(() => offsetRoute(makeRoute([A, B]), "urn:line", new Map())).toThrow(
      /no offset for urn:line/,
    );
  });
});
