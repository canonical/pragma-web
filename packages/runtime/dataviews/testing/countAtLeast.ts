import type { Count } from "../src/lib/result/index.js";

/**
 * A count claimed as a lower bound.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function countAtLeast(value: number): Count {
  return { kind: "at-least", value };
}
