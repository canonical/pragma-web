import type { DisplayStatus } from "@canonical/dataviews-core";
import type { ChartStatus } from "../types.js";

/**
 * The chart's status, read from its own facet rather than from the rows:
 * pending while no answer stands and a request is on its way; failed when
 * the applied query has no answer and none is coming; refresh-failed above
 * an answer kept through any failure that carries a reason, with rows on
 * screen or none; otherwise null, and the facet speaks for itself, an empty
 * collection included.
 */
export default function resolveChartStatus(
  status: DisplayStatus | null,
  answered: boolean,
  pending: boolean,
): ChartStatus | null {
  if (answered) {
    switch (status?.status) {
      case "failed":
      case "refused":
      case "stale":
      case "refresh-failed":
        return { status: "refresh-failed", reason: status.reason };
      default:
        return null;
    }
  }
  if (pending || status?.status === "pending") {
    return { status: "pending" };
  }
  switch (status?.status) {
    case "failed":
    case "refused":
    case "stale":
      return { status: "failed", reason: status.reason };
    case "no-access":
      return { status: "failed", reason: "" };
    default:
      return null;
  }
}
