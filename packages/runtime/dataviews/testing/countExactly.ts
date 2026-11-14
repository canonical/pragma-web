import type { Count } from "../src/lib/result/index.js";

/** A count claimed exactly. */
export default function countExactly(value: number): Count {
  return { kind: "exact", value };
}
