/**
 * Regression: the space past a fixed or capped last column stays empty.
 *
 * Before the fix, the last column took whatever width the others left,
 * even past its own maximum or its fixed width, so a table of fixed columns
 * narrower than its container drew its last column wider than it declared.
 * That space is the table's, not a column's: only a flexible last column
 * takes it, and only up to its maximum.
 */

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("regression 0128 — a fixed last column stretched to the edge", () => {
  it("keeps a fixed last column at its width in a wider container", () => {
    const notified: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          notified.push(callback);
        }
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    const { provider } = createMachineProvider();
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", sizing: { kind: "fixed", px: 200 } },
          { id: "owner", header: "Owner", sizing: { kind: "fixed", px: 120 } },
        ]}
        label="Machines"
      />,
    );
    act(() => {
      for (const observer of notified) {
        observer(
          [{ contentRect: { width: 768 } }] as unknown as ResizeObserverEntry[],
          {} as ResizeObserver,
        );
      }
    });
    expect(
      screen
        .getByRole("table", { name: "Machines" })
        .style.getPropertyValue("--data-table-columns"),
    ).toBe("200px 120px");
  });
});
