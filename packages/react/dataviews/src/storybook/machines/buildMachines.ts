import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { storyMachines } from "./fixtures.js";
import type { Machine } from "./types.js";

/**
 * `count` machines for the virtualized stories, made from the twelve fixtures in
 * turn — their statuses, regions, owners and notes — each host numbered.
 */
export default function buildMachines(count: number): readonly Machine[] {
  return Array.from({ length: count }, (_, position) => ({
    ...assertInvariant(
      storyMachines.at(position % storyMachines.length),
      "a position modulo the fixtures' length is in range",
    ),
    id: `n-${position}`,
    name: `node-${String(position).padStart(5, "0")}.example.com`,
  }));
}
