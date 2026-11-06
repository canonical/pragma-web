/**
 * One row's selection cell, mounted on its own in a row: a checkbox named
 * after the record, backed by the provider's selection.
 */
import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../../../testing/buildMachine.js";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import deliverRows from "../../../../../../testing/deliverRows.js";
import type { Machine } from "../../../../../../testing/types.js";
import SelectionCell from "./SelectionCell.js";
import type { SelectionCellProps } from "./types.js";

/** A body row, as the table draws it: a div with the role. */
const BodyRow = ({ children }: { readonly children: ReactNode }) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own rows are divs with this role, which the cell sits in
  // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, as the table's is
  <div role="row">{children}</div>
);

/** The cell over one delivered machine, named by its name. */
const mount = (props: Partial<SelectionCellProps<Machine>> = {}) => {
  const { provider } = createMachineProvider();
  const host = readProviderHost(provider);
  host.complete(host.refresh(), deliverRows([buildMachine("m-1", "alpha")]));
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields: ["name"],
  });
  const view = render(
    <BodyRow>
      <SelectionCell
        provider={provider}
        channels={scopes.readRow("m-1")}
        selected={false}
        rowLabel={(row) => row.name}
        {...props}
      />
    </BodyRow>,
  );
  return { ...view, provider };
};

describe("SelectionCell", () => {
  it("is a cell holding a checkbox named after the record", () => {
    mount();
    expect(screen.getByRole("cell")).toContainElement(
      screen.getByRole("checkbox", { name: "Select alpha" }),
    );
  });

  it("shows whether the row is selected", () => {
    mount({ selected: true });
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles the row's identity in the provider's selection", () => {
    const { provider } = mount();
    fireEvent.click(screen.getByRole("checkbox"));
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
  });

  it("draws as the body cell's selection part", () => {
    mount();
    expect(screen.getByRole("cell")).toHaveClass(
      "ds",
      "data-table-body-cell",
      "selection",
    );
  });
});
