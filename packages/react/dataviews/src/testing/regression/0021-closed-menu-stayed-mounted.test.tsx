/**
 * Regression: a header menu, once closed, costs the page nothing again.
 *
 * Before the fix, a menu mounted on its first open stayed mounted after it
 * closed, keeping its portalled surface, its observers and its window
 * listeners for the rest of the page's life — one set for every column a
 * reader had ever sorted from.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import buildMachine from "../../../testing/buildMachine.js";
import createMachineProvider from "../../../testing/createMachineProvider.js";
import declareMachineOrdering from "../../../testing/declareMachineOrdering.js";
import installPopoverStandIn from "../../../testing/installPopoverStandIn.js";
import openMenuFrom from "../../../testing/openMenuFrom.js";
import waitForFocus from "../../../testing/waitForFocus.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("regression 0021 — a closed menu stayed mounted", () => {
  let uninstallPopovers: () => void;
  beforeAll(() => {
    uninstallPopovers = installPopoverStandIn();
  });
  afterAll(() => {
    uninstallPopovers();
  });

  it("drops its open menu and window listeners once closed, and hands focus to its button", async () => {
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    onTestFinished(() => {
      added.mockRestore();
      removed.mockRestore();
    });
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      capabilities: declareMachineOrdering(null),
    });
    render(
      <DataTable
        provider={provider}
        columns={[{ id: "name", header: "Name", sortable: true }]}
        label="Machines"
      />,
    );
    const trigger = screen.getByRole("button", {
      name: "Column options for Name",
    });
    trigger.focus();
    await openMenuFrom(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitForFocus(trigger);
    expect(screen.queryByRole("menu")).toBeNull();
    const countCalls = (spy: typeof added, type: string): number =>
      spy.mock.calls.filter(([registered]) => registered === type).length;
    expect(countCalls(added, "pageshow")).toBeGreaterThan(0);
    for (const type of ["pageshow", "resize", "scroll"]) {
      expect(countCalls(removed, type)).toBe(countCalls(added, type));
    }
  });
});
