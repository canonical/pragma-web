import { formatPathData } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import offsetLane from "./offsetLane.js";
import routeNeighbourBridges from "./routeNeighbourBridges.js";

/** A gap between two regions, 48px wide, as the packer leaves one. */
const GAP = { from: 96, to: 144 } as const;

/** The routes' path data, as an edge draws them. */
const draw = (...args: Parameters<typeof routeNeighbourBridges>) =>
  routeNeighbourBridges(...args).map((commands) => formatPathData(commands));

describe("routeNeighbourBridges", () => {
  it("runs a lone bridge straight across the gap's middle", () => {
    expect(
      draw([{ startX: 96, portA: 56, endX: 144, portB: 136 }], GAP, 0),
    ).toEqual(["M96 56H120V136H144"]);
  });

  it("runs bridges straight in lanes, a bridge leaving at the height another enters at crossing first", () => {
    expect(
      draw(
        [
          { startX: 96, portA: 48, endX: 144, portB: 96 },
          { startX: 96, portA: 96, endX: 144, portB: 144 },
        ],
        GAP,
        0,
      ),
    ).toEqual(["M96 48H124V96H144", "M96 96H116V144H144"]);
  });

  it("orders the lanes the same way for a bridge leaving the right region", () => {
    expect(
      draw(
        [
          { startX: 144, portA: 96, endX: 96, portB: 48 },
          { startX: 144, portA: 144, endX: 96, portB: 96 },
        ],
        GAP,
        0,
      ),
    ).toEqual(["M144 96H124V48H96", "M144 144H116V96H96"]);
  });

  it("arches over the shelf in nested lanes where the ports cross at the same two heights", () => {
    expect(
      draw(
        [
          { startX: 96, portA: 56, endX: 144, portB: 136 },
          { startX: 96, portA: 136, endX: 144, portB: 56 },
        ],
        GAP,
        0,
      ),
    ).toEqual(["M96 56H108V-28H132V136H144", "M96 136H116V-20H124V56H144"]);
  });

  it("spreads lanes at most a lane apart, whole, and none for a lone lane", () => {
    expect(offsetLane(0, 1, 32)).toBe(0);
    expect([0, 1, 2].map((index) => offsetLane(index, 3, 32))).toEqual([
      -8, 0, 8,
    ]);
    expect([0, 1, 2, 3].map((index) => offsetLane(index, 4, 8))).toEqual([
      -3, -1, 1, 3,
    ]);
  });
});
