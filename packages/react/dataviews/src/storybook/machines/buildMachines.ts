import { machines } from "./fixtures.js";
import type { Machine } from "./types.js";

/**
 * `count` machines for the virtualized stories, made from the twelve fixtures in
 * turn — their statuses, regions, owners and notes — each host numbered.
 */
export default function buildMachines(count: number): readonly Machine[] {
  return Array.from({ length: count }, (_, position) => ({
    ...(machines[position % machines.length] as Machine),
    id: `n-${position}`,
    name: `node-${String(position).padStart(5, "0")}.example.com`,
  }));
}
