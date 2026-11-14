import buildMachine from "./buildMachine.js";
import type { Machine } from "./types.js";

/**
 * A fleet of `count` machines numbered from one, named `host-001` onward:
 * every third one failed, each with as many cores as its number, so an
 * ordering by cores is an ordering by number.
 */
export default function buildFleet(count: number): readonly Machine[] {
  return Array.from({ length: count }, (_unused, at) => {
    const number = String(at + 1).padStart(3, "0");
    return buildMachine(
      `m-${number}`,
      `host-${number}`,
      (at + 1) % 3 === 0 ? "failed" : "running",
      at + 1,
    );
  });
}
