import type { Count } from "@canonical/dataviews-core";

/** One count a source claims exactly. */
export default function countExactly(value: number): Count {
  return {
    kind: "exact",
    value,
  };
}
