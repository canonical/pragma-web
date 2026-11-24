/**
 * Regression: opening a header menu keeps focus on a control.
 *
 * Before the fix, the button a reader activated unmounted as the menu
 * mounted, and the menu moved focus to its first item only frames after it
 * opened, so focus sat on the document in between: a key pressed in that gap
 * went nowhere, and a screen reader could announce the document.
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  declareMachineOrdering,
  installPopoverStandIn,
  waitForFocus,
} from "../../../testing/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("regression 0023 — opening a menu left focus on the document", () => {
  let uninstall = (): void => {};
  beforeAll(() => {
    uninstall = installPopoverStandIn();
  });
  afterAll(() => {
    uninstall();
  });

  it("holds focus on the menu's own button while the menu opens", async () => {
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
    const findTrigger = () =>
      screen.getByRole("button", { name: "Column options for Name" });
    const trigger = findTrigger();
    trigger.focus();
    await act(async () => {
      fireEvent.click(trigger);
    });
    // Open, before any frame passes: the same button, still holding focus.
    const menu = screen.getByRole("menu");
    expect(findTrigger()).toBe(trigger);
    expect(trigger).toHaveFocus();
    // Then the menu takes focus on its first item.
    await waitForFocus(
      within(menu).getByRole("menuitem", { name: "Sort ascending" }),
    );
  });
});
