import { describe, expect, it } from "vitest";
import { LATTICE_PITCH } from "./constants.js";
import snapToLattice from "./snapToLattice.js";

describe("snapToLattice", () => {
  it("keeps a coordinate already on the lattice", () => {
    expect(snapToLattice(0)).toBe(0);
    expect(snapToLattice(3 * LATTICE_PITCH)).toBe(3 * LATTICE_PITCH);
  });

  it("snaps a coordinate between two dots down to the lower one", () => {
    expect(snapToLattice(LATTICE_PITCH - 1)).toBe(0);
    expect(snapToLattice(2 * LATTICE_PITCH + 0.5)).toBe(2 * LATTICE_PITCH);
  });
});
