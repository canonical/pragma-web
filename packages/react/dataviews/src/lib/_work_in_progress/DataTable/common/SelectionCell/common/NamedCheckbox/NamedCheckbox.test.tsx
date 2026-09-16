/**
 * A row's selection cell once the row's name is known: a cell holding one
 * checkbox named for the row, checked as the row is, toggling the row.
 */
import { createRowScopes } from "@canonical/dataviews-core/bindings";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  createMachineProvider,
  machine,
} from "../../../../../../../../testing/machines.js";
import NamedCheckbox from "./NamedCheckbox.js";

describe("NamedCheckbox", () => {
  it("names the checkbox for the row, and toggles the row", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    const release = provider.observe();
    onTestFinished(release);
    const channels = createRowScopes({
      rows: provider.rows,
      selection: provider.selection,
      fields: [],
      readType: () => null,
    }).readRow("m-1");
    render(
      <NamedCheckbox
        provider={provider}
        channels={channels}
        selected
        name="alpha"
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Select alpha" });
    expect(screen.getByRole("cell")).toContainElement(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
  });
});
