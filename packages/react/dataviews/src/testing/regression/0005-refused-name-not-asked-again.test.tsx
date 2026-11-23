/**
 * Regression: submitting a refused name again asks the collection again.
 *
 * Before the fix, the refusal set as the input's validity stood until the
 * name was edited, and the browser checks validity before the form submits,
 * so the same name resubmitted — after another tab had renamed the view it
 * clashed with — never reached the collection: the stale refusal was shown
 * again instead.
 */

import { buildStoredView } from "@canonical/dataviews-core/testing";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  createMemoryViewStore,
} from "../../../testing/index.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

describe("regression 0005 — a refused name was not asked again", () => {
  it("clears the standing refusal as the submit begins, so the name is checked anew", async () => {
    const views = createMemoryViewStore([
      buildStoredView({ id: "v-failed", name: "Failed", query: "" }),
    ]);
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      views: views.store,
    });
    render(
      <DataViews provider={provider}>
        <DataViews.SavedViews />
      </DataViews>,
    );
    const select = screen.getByRole("combobox", { name: "View" });
    await waitFor(() => {
      expect(select).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Save as…" }));
    const form = screen.getByRole("form", { name: "Save as a new view" });
    const name = within(form).getByRole<HTMLInputElement>("textbox", {
      name: "Name",
    });
    const save = within(form).getByRole("button", { name: "Save view" });
    const reported = vi.fn();
    name.addEventListener("invalid", reported);
    // An empty name never reaches the collection: the browser refuses it.
    fireEvent.click(save);
    expect(reported).toHaveBeenCalledTimes(1);
    expect(select.querySelectorAll("option")).toHaveLength(2);
    fireEvent.change(name, { target: { value: "failed" } });
    // Submitted from the button, the focus is there; a refusal brings it
    // back to the name.
    save.focus();
    fireEvent.click(save);
    await waitFor(() => {
      expect(name.validationMessage).toBe(
        'A view named "Failed" already exists.',
      );
    });
    expect(name).toHaveFocus();
    // The refusal was reported through the browser's own channel too.
    expect(reported).toHaveBeenCalledTimes(2);
    // Another tab renames the clashing view; the same name is tried again.
    views.elsewhere("v-failed", { name: "Old failures" });
    fireEvent.click(save);
    expect(name).toBeValid();
    expect(await screen.findByText('Saved "failed".')).toBeInTheDocument();
  });
});
