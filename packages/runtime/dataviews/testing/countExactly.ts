import type { Count } from "../src/lib/result/index.js";

/**
 * A count claimed exactly.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function countExactly(value: number): Count {
  return { kind: "exact", value };
}
