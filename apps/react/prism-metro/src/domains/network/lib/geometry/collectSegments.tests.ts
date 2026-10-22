// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../../testing/buildNetworkLines.js";
import { METRO_NAMESPACE } from "../../../../../testing/fixtures.js";
import collectSegments from "./collectSegments.js";
import type { DiagramLine, DiagramRoute } from "./types.js";

const lines = buildNetworkLines();

/** The first route of the fixture line titled `title`. */
const findRoute = (title: string, index = 0): DiagramRoute =>
  (lines.find((line) => line.title === title) as DiagramLine).routes.at(
    index,
  ) as DiagramRoute;

describe("collectSegments", () => {
  it("joins each pair of consecutive stops of a linear route", () => {
    const segments = collectSegments(findRoute("North Line"));
    expect(segments).toHaveLength(4);
    expect(segments.at(0)?.start.title).toBe("Northgate");
    expect(segments.at(-1)?.end.title).toBe("Marsh End");
  });

  it("closes a loop from its last stop back to its first", () => {
    const segments = collectSegments(findRoute("Circle Line"));
    expect(segments).toHaveLength(6);
    expect(segments.at(-1)?.start.title).toBe("Riverside Junction");
    expect(segments.at(-1)?.end.title).toBe("Central Exchange");
  });

  it("keys a segment the same whichever way a route runs over it", () => {
    const southbound = collectSegments(findRoute("North Line", 0));
    const northbound = collectSegments(findRoute("North Line", 1));
    expect(southbound.map((segment) => segment.key).sort()).toEqual(
      northbound.map((segment) => segment.key).sort(),
    );
    const [first] = southbound;
    expect(first?.from.uri < (first?.to.uri as string)).toBe(true);
    expect(first?.key).toBe(
      `${METRO_NAMESPACE}northgate ${METRO_NAMESPACE}verge-park`,
    );
  });

  it("adds no closing segment to a loop over two stops", () => {
    const route = findRoute("North Line");
    const twoStops = { ...route, isLoop: true, stops: route.stops.slice(0, 2) };
    expect(collectSegments(twoStops)).toHaveLength(1);
  });
});
