/**
 * Regression: a header menu nobody has opened costs the page nothing.
 *
 * Before the fix, every sortable header mounted its menu at once, and each
 * registered window listeners, observers and a portalled surface for a menu
 * no one had opened — on a wide table, dozens of them for as long as the
 * page stayed open.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  declareMachineOrdering,
} from "../../../testing/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("regression 0013 — closed header menus listened to the window", () => {
  it("registers no window listener and draws no menu until one opens", () => {
    const listened = vi.spyOn(window, "addEventListener");
    onTestFinished(() => {
      listened.mockRestore();
    });
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      capabilities: declareMachineOrdering(null),
    });
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", sortable: true },
          { id: "status", header: "Status", sortable: true },
          { id: "cores", header: "Cores", sortable: true },
        ]}
        label="Machines"
      />,
    );
    expect(
      listened.mock.calls
        .map(([type]) => type)
        .filter((type) => ["resize", "scroll", "pageshow"].includes(type)),
    ).toEqual([]);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("observes nothing beyond what the same table without menus observes", () => {
    let observed = 0;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(): void {
          observed += 1;
        }
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      capabilities: declareMachineOrdering(null),
    });
    const renderTable = (sortable: boolean) =>
      render(
        <DataTable
          provider={provider}
          columns={[
            { id: "name", header: "Name", sortable },
            { id: "status", header: "Status", sortable },
            { id: "cores", header: "Cores", sortable },
          ]}
          label="Machines"
        />,
      );
    const withMenus = renderTable(true);
    const observedWithMenus = observed;
    withMenus.unmount();
    observed = 0;
    renderTable(false);
    expect(observedWithMenus).toBe(observed);
  });
});
