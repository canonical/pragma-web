/**
 * The table within the UI scope it is handed: it speaks the words it is
 * given and through the announcer it is given, never resolving its own,
 * and takes its root's native props.
 */
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import machine from "../../../../../../testing/machine.js";
import type { DataTableColumn } from "../../types.js";
import ScopedDataTable from "./ScopedDataTable.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name", resizable: true },
  { id: "status", header: "Status" },
];

describe("ScopedDataTable", () => {
  it("refuses a provider createDataViewsProvider did not create", () => {
    const failure = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <ScopedDataTable
          provider={{} as never}
          columns={columns}
          label="Machines"
          messages={resolveMessages()}
          announce={() => {}}
        />,
      ),
    ).toThrow(
      "DataTable requires a provider created by createDataViewsProvider",
    );
    failure.mockRestore();
  });

  it("speaks the words it is handed", () => {
    const { provider } = createMachineProvider({ rows: [] });
    render(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        messages={resolveMessages({ statusNoData: "Nothing here yet." })}
        announce={() => {}}
      />,
    );
    expect(screen.getByRole("table", { name: "Machines" })).toHaveTextContent(
      "Nothing here yet.",
    );
  });

  it("says a resize handle's hint through the announcer it is handed", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    const announce = vi.fn();
    render(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        messages={resolveMessages()}
        announce={announce}
      />,
    );
    const handle = screen.getByRole("separator", { name: "Name" });
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    act(() => {
      fireEvent.pointerUp(window, { clientX: 100 });
    });
    expect(announce).toHaveBeenCalledWith(
      "Click or tap in the header row where the Name column should end. Press the edge again or Escape to cancel.",
    );
  });

  it("takes the native props of its root, merging the class name, style and ref", () => {
    const { provider } = createMachineProvider({ rows: [] });
    const ref = createRef<HTMLDivElement>();
    render(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        messages={resolveMessages()}
        announce={() => {}}
        className="inventory"
        style={{ maxHeight: "20rem" }}
        title="All machines"
        ref={ref}
      />,
    );
    const table = screen.getByRole("table", { name: "Machines" });
    expect(table).toHaveClass("ds", "data-table", "dense", "inventory");
    expect(table).toHaveStyle({ maxHeight: "20rem" });
    expect(table).toHaveAttribute("title", "All machines");
    expect(ref.current).toBe(table);
  });
});
