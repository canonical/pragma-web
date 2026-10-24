import { describe, expect, it } from "vitest";
import allocatePorts from "./allocatePorts.js";

describe("allocatePorts", () => {
  it("gives a side with no requests no ports", () => {
    expect(allocatePorts(32, [], [], false)).toEqual({ ys: [], level: 0 });
  });

  it("places ports nearest their ideals, in order, clear of the tick", () => {
    expect(
      allocatePorts(32, [{ kind: "tick", y: 16 }], [16, 30], false),
    ).toEqual({
      ys: [8, 24],
      level: 0,
    });
  });

  it("starts a hub at the hub clearance, 4px from its tick", () => {
    expect(allocatePorts(48, [{ kind: "tick", y: 24 }], [24], true)).toEqual({
      ys: [20],
      level: 1,
    });
  });

  it("keeps a loop's end 4px away like another port", () => {
    expect(allocatePorts(32, [{ kind: "loop", y: 8 }], [8], false).ys).toEqual([
      12,
    ]);
  });

  it("relaxes a crowded side to the next level", () => {
    const { level, ys } = allocatePorts(
      32,
      [{ kind: "tick", y: 16 }],
      [8, 12, 20, 24],
      false,
    );
    expect(level).toBe(1);
    expect(ys).toEqual([8, 12, 20, 24]);
  });

  it("fails when no level holds the ports", () => {
    expect(() =>
      allocatePorts(
        32,
        [],
        Array.from({ length: 20 }, () => 16),
        false,
      ),
    ).toThrow(/no port allocation holds 20 ports on a 32px side/);
  });
});
