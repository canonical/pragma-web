/**
 * The table within the UI scope it is handed: it speaks the words it is
 * given and through the announcer it is given, never resolving its own,
 * and takes its root's native props.
 */
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
} from "../../../../../testing/index.js";
import type { DataTableColumn } from "./common/index.js";
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

  it("draws a header row group and a body row group of rows and cells", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha"), buildMachine("m-2", "beta")],
    });
    render(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
        messages={resolveMessages()}
        announce={() => {}}
      />,
    );
    const table = screen.getByRole("table", { name: "Machines" });
    expect(table.tagName).toBe("TABLE");
    const [header, body] = within(table).getAllByRole("rowgroup");
    expect(header?.tagName).toBe("THEAD");
    expect(body?.tagName).toBe("TBODY");
    expect(header?.className).toBe("header");
    expect(body?.className).toBe("ds data-table-body");
    expect(
      within(header as HTMLElement).getAllByRole("columnheader"),
    ).toHaveLength(3);
    within(header as HTMLElement).getByRole("columnheader", { name: "Name" });
    within(header as HTMLElement).getByRole("columnheader", { name: "Status" });
    const rows = within(body as HTMLElement).getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows.at(0) as HTMLElement).getAllByRole("cell")).toHaveLength(
      3,
    );
  });

  it("spans the status cell over every track the header draws", () => {
    const { provider } = createMachineProvider({ rows: [] });
    render(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
        settings={<span>Settings</span>}
        messages={resolveMessages()}
        announce={() => {}}
      />,
    );
    const [header, body] = screen.getAllByRole("rowgroup");
    const tracks = within(header as HTMLElement).getAllByRole("columnheader");
    expect(tracks).toHaveLength(4);
    expect(within(body as HTMLElement).getByRole("cell")).toHaveAttribute(
      "colspan",
      String(tracks.length),
    );
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
      rows: [buildMachine("m-1", "alpha")],
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

  it("names rows anew once handed a new getRowLabel", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    const messages = resolveMessages();
    const { rerender } = render(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
        getRowLabel={(_row, rowId) => `machine ${rowId}`}
        messages={messages}
        announce={() => {}}
      />,
    );
    rerender(
      <ScopedDataTable
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
        getRowLabel={(_row, rowId) => `machine ${rowId} (fr)`}
        messages={messages}
        announce={() => {}}
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: "Select machine m-1 (fr)" }),
    ).toBeInTheDocument();
  });

  it("takes the native props of its root, merging the class name, style and ref", () => {
    const { provider } = createMachineProvider({ rows: [] });
    const ref = createRef<HTMLTableElement>();
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
    expect(table.style.maxHeight).toBe("20rem");
    expect(table).toHaveAttribute("title", "All machines");
    expect(ref.current).toBe(table);
  });
});
