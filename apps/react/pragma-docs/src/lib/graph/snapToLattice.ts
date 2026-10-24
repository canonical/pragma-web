import { LATTICE_PITCH } from "./constants.js";

/**
 * Snap a coordinate to the lattice: the nearest multiple of the lattice's
 * pitch at or below it, so a box placed there has its corner on a dot.
 *
 * @param value - A coordinate, in SVG user units.
 * @returns The largest multiple of `LATTICE_PITCH` not above `value`.
 */
export default function snapToLattice(value: number): number {
  return Math.floor(value / LATTICE_PITCH) * LATTICE_PITCH;
}
