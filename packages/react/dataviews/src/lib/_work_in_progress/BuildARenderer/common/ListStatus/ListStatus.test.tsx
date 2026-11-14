import type { DisplayStatus } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ListStatus from "./ListStatus.js";

const english = resolveMessages();

describe("ListStatus", () => {
  it.each<[DisplayStatus, string]>([
    [{ status: "failed", reason: "offline" }, english.statusFailed("offline")],
    [
      { status: "refused", reason: "melted is not a status" },
      english.statusRefused("melted is not a status"),
    ],
    [
      { status: "refresh-failed", reason: "offline" },
      english.statusRefreshFailed("offline"),
    ],
    [{ status: "stale", reason: "offline" }, english.statusStale("offline")],
    [{ status: "no-results" }, english.statusNoResults],
    [{ status: "no-data" }, english.statusNoData],
  ])("says a settled %o as a status message", (status, text) => {
    render(<ListStatus status={status} messages={english} />);
    expect(screen.getByRole("status")).toHaveTextContent(text);
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-status",
      status.status,
    );
  });

  it.each<[DisplayStatus, string]>([
    [{ status: "pending" }, english.statusPending],
    [{ status: "regrouping" }, english.statusRegrouping],
  ])("shows a passing %o without announcing it", (status, text) => {
    const view = render(<ListStatus status={status} messages={english} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(view.container).toHaveTextContent(text);
  });

  it("takes the native props of its root, keeping its own status", () => {
    render(
      <ListStatus
        status={{ status: "no-data" }}
        messages={english}
        className="extra"
        title="From the list"
      />,
    );
    const root = screen.getByRole("status");
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("title", "From the list");
    expect(root).toHaveAttribute("data-status", "no-data");
  });
});
