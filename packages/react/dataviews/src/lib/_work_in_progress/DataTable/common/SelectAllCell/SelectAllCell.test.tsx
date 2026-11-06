/**
 * The select-all cell, mounted on its own in a header row: a checkbox over
 * the displayed rows that adds and removes exactly those, leaving a
 * selection made elsewhere alone, and the geometry it attaches to.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import createFakeChannel from "../../../../../../testing/createFakeChannel.js";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import SelectAllCell from "./SelectAllCell.js";
import type { SelectAllCellProps } from "./types.js";

/** The table's header row, as it draws it: a div with the role. */
const HeaderRow = ({ children }: { readonly children: ReactNode }) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own header row is a div with this role, which the cell sits in
  // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, as the table's is
  <div role="row">{children}</div>
);

/** The cell over these displayed rows, its geometry a spy. */
const mount = (
  displayed: readonly string[],
  props: Partial<SelectAllCellProps> = {},
) => {
  const { provider } = createMachineProvider();
  const release = vi.fn();
  const reserve = vi.fn((_cell: HTMLDivElement) => release);
  const view = render(
    <HeaderRow>
      <SelectAllCell
        selection={provider.selection}
        ids={createFakeChannel(displayed)}
        reserve={reserve}
        {...props}
      />
    </HeaderRow>,
  );
  return { ...view, provider, reserve, release };
};

const checkbox = (): HTMLInputElement =>
  screen.getByRole<HTMLInputElement>("checkbox", {
    name: "Select all displayed rows",
  });

describe("SelectAllCell", () => {
  it("is a column header holding the checkbox", () => {
    mount(["m-1"]);
    expect(screen.getByRole("columnheader")).toContainElement(checkbox());
  });

  it("is unchecked while none of the displayed rows is selected", () => {
    mount(["m-1", "m-2"]);
    expect(checkbox().checked).toBe(false);
    expect(checkbox().indeterminate).toBe(false);
  });

  it("is mixed while some of the displayed rows are selected", () => {
    const { provider } = mount(["m-1", "m-2"]);
    fireEvent.click(checkbox());
    act(() => {
      provider.selection.remove(["m-2"]);
    });
    expect(checkbox().indeterminate).toBe(true);
  });

  it("adds the displayed rows and keeps a selection made elsewhere", () => {
    const { provider } = mount(["m-1", "m-2"]);
    act(() => {
      provider.selection.add(["m-9"]);
    });
    fireEvent.click(checkbox());
    expect(checkbox().checked).toBe(true);
    expect([...provider.selection.state.get().ids].sort()).toEqual([
      "m-1",
      "m-2",
      "m-9",
    ]);
  });

  it("removes only the displayed rows once they are all selected", () => {
    const { provider } = mount(["m-1"]);
    act(() => {
      provider.selection.add(["m-1", "m-9"]);
    });
    fireEvent.click(checkbox());
    expect([...provider.selection.state.get().ids]).toEqual(["m-9"]);
  });

  it("attaches itself to the table's geometry, and lets go on unmount", () => {
    const { reserve, release, unmount } = mount(["m-1"]);
    expect(reserve).toHaveBeenCalledWith(screen.getByRole("columnheader"));
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("draws as the header cell's selection part", () => {
    mount(["m-1"]);
    expect(screen.getByRole("columnheader")).toHaveClass(
      "ds",
      "data-table-header-cell",
      "selection",
    );
  });
});
