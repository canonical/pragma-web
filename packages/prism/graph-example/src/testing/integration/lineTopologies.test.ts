// =============================================================================
// The four line topologies the network model has to carry, each read through
// GraphQL off the line that exhibits it:
//
//   - a linear line, run both ways between two termini;
//   - a loop run both ways (the Circle);
//   - two linear lines that share both termini and together close a ring;
//   - a ring run by two lines in opposite directions over the same stops.
//
// Direction is data: every assertion below reads the order off a route's
// calls, never off the line.
// =============================================================================

import { beforeAll, describe, expect, it } from "vitest";
import { assertPresent } from "../assertPresent.js";
import {
  BIDIRECTIONAL_LOOP_LINE_URI,
  DIRECTIONAL_RING_LINE_URIS,
  HALF_RING_LINE_URIS,
  LINEAR_LINE_URI,
} from "../fixtures.js";
import { readNetwork } from "../readNetwork.js";
import type { Network, NetworkLine, NetworkRoute } from "../types.js";

let network: Network;

beforeAll(async () => {
  network = await readNetwork();
});

/** The line with this IRI, failing the test when the network lacks it. */
const findLine = (uri: string): NetworkLine =>
  assertPresent(
    network.lines.find((candidate) => candidate.uri === uri),
    `the network has no line ${uri}`,
  );

/** The route at `index` of a line, failing the test when there is none. */
const findRoute = (line: NetworkLine, index: number): NetworkRoute =>
  assertPresent(line.routes.at(index), `${line.uri} has no route ${index}`);

/** The stop IRIs a route calls at, in call order. */
const listStops = (route: NetworkRoute): string[] =>
  route.calls.map((call) => call.stop.uri);

/** The same cycle written from `start`: rotate the list so it begins there. */
const rotateTo = (stops: readonly string[], start: string): string[] => {
  const index = stops.indexOf(start);
  return [...stops.slice(index), ...stops.slice(0, index)];
};

describe("a linear line", () => {
  it("runs two routes, neither a loop, each the other's reverse", () => {
    const line = findLine(LINEAR_LINE_URI);
    expect(line.routes).toHaveLength(2);
    const [outbound, inbound] = [findRoute(line, 0), findRoute(line, 1)];
    expect([outbound.isLoop, inbound.isLoop]).toEqual([false, false]);
    expect(outbound.reverse?.label).toBe(inbound.label);
    expect(inbound.reverse?.label).toBe(outbound.label);
  });

  it("calls at the same stops in the opposite order on the way back", () => {
    const line = findLine(LINEAR_LINE_URI);
    expect(listStops(findRoute(line, 1))).toEqual(
      listStops(findRoute(line, 0)).reverse(),
    );
  });
});

describe("a bidirectional loop", () => {
  it("runs two loop routes, each the other's reverse", () => {
    const line = findLine(BIDIRECTIONAL_LOOP_LINE_URI);
    expect(line.routes).toHaveLength(2);
    const [clockwise, anticlockwise] = [findRoute(line, 0), findRoute(line, 1)];
    expect([clockwise.isLoop, anticlockwise.isLoop]).toEqual([true, true]);
    expect(clockwise.reverse?.label).toBe(anticlockwise.label);
    expect(anticlockwise.reverse?.label).toBe(clockwise.label);
  });

  it("starts both ways at one stop and runs the rest of the ring reversed", () => {
    const line = findLine(BIDIRECTIONAL_LOOP_LINE_URI);
    const [first, ...rest] = listStops(findRoute(line, 0));
    expect(listStops(findRoute(line, 1))).toEqual([first, ...rest.reverse()]);
  });

  it("never repeats the first stop at the end", () => {
    const line = findLine(BIDIRECTIONAL_LOOP_LINE_URI);
    for (const route of line.routes) {
      const stops = listStops(route);
      expect(new Set(stops).size).toBe(stops.length);
    }
  });
});

describe("two half-rings closing a ring", () => {
  const readOutbound = (): [string[], string[]] => {
    const [first, second] = HALF_RING_LINE_URIS;
    return [
      listStops(findRoute(findLine(first), 0)),
      listStops(findRoute(findLine(second), 0)),
    ];
  };

  it("are two linear lines", () => {
    for (const uri of HALF_RING_LINE_URIS) {
      const line = findLine(uri);
      expect(line.routes).toHaveLength(2);
      expect(line.routes.map((route) => route.isLoop)).toEqual([false, false]);
    }
  });

  it("share both termini and no other station", () => {
    const [first, second] = readOutbound();
    expect(second.at(0)).toBe(first.at(0));
    expect(second.at(-1)).toBe(first.at(-1));
    const shared = first.filter((stop) => second.includes(stop));
    expect(shared).toEqual([first.at(0), first.at(-1)]);
  });

  it("visit every station once going out on one and back on the other", () => {
    const [first, second] = readOutbound();
    const ring = [...first, ...second.slice(1, -1).reverse()];
    expect(new Set(ring).size).toBe(ring.length);
    expect(new Set(ring)).toEqual(new Set([...first, ...second]));
    // The way back ends where the way out began, so the ring closes.
    expect(second.at(0)).toBe(ring.at(0));
  });
});

describe("a directional ring pair", () => {
  const readRings = (): [NetworkRoute, NetworkRoute] => {
    const [first, second] = DIRECTIONAL_RING_LINE_URIS;
    return [findRoute(findLine(first), 0), findRoute(findLine(second), 0)];
  };

  it("is two lines with one loop route each and no reverse", () => {
    for (const uri of DIRECTIONAL_RING_LINE_URIS) {
      const line = findLine(uri);
      expect(line.routes).toHaveLength(1);
      expect(findRoute(line, 0).isLoop).toBe(true);
      expect(findRoute(line, 0).reverse).toBeNull();
    }
  });

  it("runs the same stops in opposite cyclic order", () => {
    const [clockwise, anticlockwise] = readRings();
    const [first, ...rest] = listStops(clockwise);
    const start = assertPresent(first, `${clockwise.label} calls nowhere`);
    expect(rotateTo(listStops(anticlockwise), start)).toEqual([
      start,
      ...rest.reverse(),
    ]);
  });

  it("has no other line calling at its stations", () => {
    const [clockwise] = readRings();
    const ringStops = new Set(listStops(clockwise));
    const others = network.lines.filter(
      (line) =>
        !(DIRECTIONAL_RING_LINE_URIS as readonly string[]).includes(line.uri),
    );
    for (const line of others) {
      for (const route of line.routes) {
        expect(listStops(route).filter((stop) => ringStops.has(stop))).toEqual(
          [],
        );
      }
    }
  });
});
