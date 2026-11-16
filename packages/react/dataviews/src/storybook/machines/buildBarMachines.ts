import type { BarMachine } from "./types.js";

/** The statuses, in the order the machines take them. */
const STATUSES = [
  "deployed",
  "ready",
  "commissioning",
  "allocated",
  "broken",
] as const;

/** The memory sizes, in MiB, the machines take in turn. */
const MEMORY = [4096, 8192, 16_384, 32_768, 65_536, 131_072] as const;

/** The tag sets the machines take in turn. */
const TAGS = [
  ["ex-gpu", "ex-nvme"],
  ["ex-gpu"],
  ["ex-nvme"],
  [],
  ["ex-ssd", "ex-nvme"],
  ["ex-gpu", "ex-ssd"],
  ["ex-ssd"],
] as const;

/** The owners the owned machines take in turn. */
const OWNERS = ["ex:ana", "ex:ben", "ex:cai"] as const;

/**
 * Sixty machines shaped after MAAS, the same on every call: each takes the
 * next status, memory size and tag set in turn, every third has no owner,
 * and each was deployed on a day of 2026 by its number. Hosts are
 * `example.com` names. Pure.
 *
 * @returns The machines.
 */
export default function buildBarMachines(): readonly BarMachine[] {
  return Array.from({ length: 60 }, (_, index): BarMachine => {
    const number = String(index + 1).padStart(2, "0");
    // Each list is taken in turn, so the index always lands in it.
    const machine = {
      id: `bm-${number}`,
      hostname: `ex-node-${number}.example.com`,
      status: STATUSES.at(index % STATUSES.length) as BarMachine["status"],
      memory: MEMORY.at(index % MEMORY.length) as number,
      tags: TAGS.at(index % TAGS.length) as readonly string[],
      deployed: `2026-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    };
    return index % 3 === 2
      ? machine
      : { ...machine, owner: OWNERS.at(index % OWNERS.length) as string };
  });
}
