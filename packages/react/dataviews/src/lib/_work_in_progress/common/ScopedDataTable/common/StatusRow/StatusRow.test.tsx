/**
 * The status row renders what the core decided and nothing else: the
 * status as `data-status`, a settled outcome as a polite status message and
 * a passing state in silence, and the logical position a virtualized table
 * reports for it.
 */

import type { DisplayStatus } from "@canonical/dataviews-core";
import { DISPLAY_STATUS_PHASES } from "@canonical/dataviews-core/bindings";
import { readDisplayStatus } from "@canonical/dataviews-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import StatusRow from "./StatusRow.js";

/** A body row group in a table, where a row renders as it does in the table. */
const inBody = () => ({
  container: document.body.appendChild(document.createElement("table")),
  wrapper: ({ children }: { readonly children: ReactNode }) => (
    <tbody>{children}</tbody>
  ),
});

/** The words the table would give a status: here, the status named. */
const describeStatus = (status: DisplayStatus): string =>
  "reason" in status ? `${status.status}: ${status.reason}` : status.status;

describe("StatusRow", () => {
  it("carries the status as data-status on its root, over one cell", () => {
    render(
      <StatusRow
        status={{ status: "stale", reason: "offline" }}
        renderStatus={describeStatus}
        span={3}
      />,
      inBody(),
    );
    const cell = screen.getByRole("cell");
    expect(screen.getByRole("row")).toHaveAttribute("data-status", "stale");
    expect(cell.className).toBe("cell");
    expect(cell).toHaveTextContent("stale: offline");
    // One cell for the whole table: it spans every rendered track.
    expect(cell).toHaveAttribute("colspan", "3");
    expect(screen.getByRole("row").className).toBe("ds data-table-status-row");
  });

  it("announces every settled outcome once, and keeps every passing state silent", () => {
    // Every status the core knows, so a status added to the union is
    // classified here or fails here.
    for (const status of Object.keys(
      DISPLAY_STATUS_PHASES,
    ) as DisplayStatus["status"][]) {
      const { unmount } = render(
        <StatusRow
          status={readDisplayStatus(status)}
          renderStatus={describeStatus}
          span={1}
        />,
        inBody(),
      );
      const announced = screen.queryAllByRole("status");
      expect(announced, status).toHaveLength(
        DISPLAY_STATUS_PHASES[status] === "terminal" ? 1 : 0,
      );
      expect(screen.getByRole("cell"), status).toHaveTextContent(
        describeStatus(readDisplayStatus(status)),
      );
      unmount();
    }
  });

  it("reports its logical position only where a virtualized table gives one", () => {
    const { rerender } = render(
      <StatusRow
        status={{ status: "pending" }}
        renderStatus={describeStatus}
        span={1}
      />,
      inBody(),
    );
    expect(screen.getByRole("row")).not.toHaveAttribute("aria-rowindex");
    rerender(
      <StatusRow
        status={{ status: "pending" }}
        renderStatus={describeStatus}
        span={1}
        position={2}
      />,
    );
    expect(screen.getByRole("row")).toHaveAttribute("aria-rowindex", "2");
  });
});
