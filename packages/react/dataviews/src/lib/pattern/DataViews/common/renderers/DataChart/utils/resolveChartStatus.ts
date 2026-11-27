import type { DisplayStatus } from "@canonical/dataviews-core";

/**
 * The chart's status from its own facet, not its rows; null when the facet
 * speaks for itself.
 */
export default function resolveChartStatus(
  status: DisplayStatus | null,
  answered: boolean,
  pending: boolean,
): DisplayStatus | null {
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
      return status;
    default:
      return null;
  }
}
