// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../../testing/buildNetworkLines.js";
import selectDrawnRoutes from "./selectDrawnRoutes.js";
import type { DiagramLine, DiagramRoute } from "./types.js";

const lines = buildNetworkLines();

/** The routes of the fixture line titled `title`. */
const findRoutes = (title: string): readonly DiagramRoute[] =>
  (lines.find((line) => line.title === title) as DiagramLine).routes;

describe("selectDrawnRoutes", () => {
  it("draws one route of a linear line and its reverse", () => {
    expect(
      selectDrawnRoutes(findRoutes("North Line")).map((route) => route.label),
    ).toEqual(["To Marsh End"]);
  });

  it("draws one route of a loop run both ways", () => {
    expect(
      selectDrawnRoutes(findRoutes("Circle Line")).map((route) => route.label),
    ).toEqual(["Clockwise"]);
  });

  it("draws each line of a ring run by two lines, neither having a reverse", () => {
    expect(selectDrawnRoutes(findRoutes("Ringway Clockwise"))).toHaveLength(1);
    expect(selectDrawnRoutes(findRoutes("Ringway Anticlockwise"))).toHaveLength(
      1,
    );
  });

  it("keeps a route whose reverse the line does not list", () => {
    const [outbound] = findRoutes("Upland Line");
    const orphan = { ...(outbound as DiagramRoute), reverseLabel: "Nowhere" };
    expect(selectDrawnRoutes([orphan])).toEqual([orphan]);
  });
});
