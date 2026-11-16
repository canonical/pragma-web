import type {
  DataViewsMessages,
  DisplayStatus,
} from "@canonical/dataviews-core";
import { DISPLAY_STATUS_PHASES } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import type { ListStatusProps } from "./types.js";

/**
 * The message for each status. A switch over every status, so a status the
 * core adds fails to compile here until it has a message.
 */
const describe = (
  status: DisplayStatus,
  messages: DataViewsMessages,
): string => {
  switch (status.status) {
    case "pending":
      return messages.statusPending;
    case "failed":
      return messages.statusFailed(status.reason);
    case "refused":
      return messages.statusRefused(status.reason);
    case "refresh-failed":
      return messages.statusRefreshFailed(status.reason);
    case "stale":
      return messages.statusStale(status.reason);
    case "no-access":
      return messages.statusNoAccess;
    case "no-results":
      return messages.statusNoResults;
    case "no-data":
      return messages.statusNoData;
  }
};

/**
 * What a list says in place of its rows, or above them. A settled outcome
 * (`terminal`) is a polite status message; a passing state (`transient`),
 * such as loading, is shown and not announced.
 *
 * @experimental Pre-release: a tutorial example, not exported from the
 * package.
 *
 * @implements ds:apps.subcomponent.list_status
 */
export default function ListStatus({
  status,
  messages,
  ...rest
}: ListStatusProps): ReactElement {
  const text = describe(status, messages);
  return DISPLAY_STATUS_PHASES[status.status] === "terminal" ? (
    <p {...rest} data-status={status.status} role="status">
      {text}
    </p>
  ) : (
    <p {...rest} data-status={status.status}>
      {text}
    </p>
  );
}
