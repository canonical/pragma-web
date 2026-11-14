import { DISPLAY_STATUS_PHASES } from "@canonical/dataviews-core/bindings";
import type { ReactElement } from "react";
import { describeStatus } from "../../../../utils/index.js";
import type { ListStatusProps } from "./types.js";

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
  const text = describeStatus(status, messages);
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
