import type { DisplayStatus } from "@canonical/dataviews-core";

/** One display status of each kind, with a reason where the kind carries one. */
export default function readDisplayStatus(
  status: DisplayStatus["status"],
): DisplayStatus {
  return status === "failed" ||
    status === "refresh-failed" ||
    status === "stale"
    ? { status, reason: "offline" }
    : { status };
}
