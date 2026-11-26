/**
 * The table within the UI scope it is handed: it speaks the words it is
 * given and through the announcer it is given, never resolving its own,
 * and takes its root's native props.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { createStandInViewStore } from "@canonical/dataviews-core/testing";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  installPopoverStandIn,
  installResizeObserverStandIn,
  openMenuFrom,
} from "../../../../../../../testing/index.js";

import type { DataTableColumn } from "./common/index.js";
import ScopedDataTable from "./ScopedDataTable.js";

/** Stands in for `DataTable.SettingsMenu`. */
const Menu = (): null => null;

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
          id="t"
          settingsMenu={Menu}
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
        id="t"
        settingsMenu={Menu}
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
        id="t"
        settingsMenu={Menu}
        provider={provider}
        columns={columns}
        label="Machines"
        selectable
        settings={<Menu />}
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
        id="t"
        settingsMenu={Menu}
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
        id="t"
        settingsMenu={Menu}
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
        id="t"
        settingsMenu={Menu}
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
        id="t"
        settingsMenu={Menu}
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

  it("keeps a header's menu while a linked view is listed, saying why first", async () => {
    onTestFinished(installPopoverStandIn());
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      location: createMemoryLocation({ href: "/machines?view=v1" }),
      views: createStandInViewStore({ list: () => new Promise(() => {}) }),
    });
    render(
      <ScopedDataTable
        id="t"
        settingsMenu={Menu}
        provider={provider}
        columns={columns}
        label="Machines"
        settings={<Menu />}
        messages={resolveMessages()}
        announce={() => {}}
      />,
    );
    const menu = await openMenuFrom(
      screen.getByRole("button", { name: "Column options for Status" }),
    );
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    expect(items.at(0)).toHaveTextContent(
      "Columns can change once the linked view has loaded.",
    );
    for (const item of items) {
      expect(item).toHaveClass("disabled");
    }
  });

  it("draws no resize handle while a linked view is listed, keeping its place", () => {
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      location: createMemoryLocation({ href: "/machines?view=v1" }),
      views: createStandInViewStore({ list: () => new Promise(() => {}) }),
    });
    onTestFinished(provider.observe());
    render(
      <ScopedDataTable
        id="t"
        settingsMenu={Menu}
        provider={provider}
        columns={columns}
        label="Machines"
        messages={resolveMessages()}
        announce={() => {}}
      />,
    );
    expect(screen.queryByRole("separator", { name: "Name" })).toBeNull();
    // The handle's place stays, so the label does not move as it returns.
    expect(
      screen
        .getByRole("columnheader", { name: /Name/ })
        .querySelector(".handle-slot"),
    ).not.toBeNull();
  });

  it("keeps holding a header's menu once the linked view's listing fails", async () => {
    onTestFinished(installPopoverStandIn());
    const { provider } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
      location: createMemoryLocation({ href: "/machines?view=v1" }),
      views: createStandInViewStore({
        list: () => Promise.reject(new Error("offline")),
      }),
    });
    onTestFinished(provider.observe());
    await vi.waitFor(() =>
      expect(provider.views?.state.get().listing.status).toBe("failed"),
    );
    render(
      <ScopedDataTable
        id="t"
        settingsMenu={Menu}
        provider={provider}
        columns={columns}
        label="Machines"
        settings={<Menu />}
        messages={resolveMessages()}
        announce={() => {}}
      />,
    );
    const menu = await openMenuFrom(
      screen.getByRole("button", { name: "Column options for Status" }),
    );
    expect(menu.querySelector('[role="menuitem"]')).toHaveTextContent(
      "Columns can change once the linked view has loaded.",
    );
  });

  it.fails("frames the table, then the footer, then the announcer it is handed", () => {
    const { provider } = createMachineProvider({ rows: [] });
    const { container } = render(
      <ScopedDataTable
        settingsMenu={Menu}
        provider={provider}
        columns={columns}
        label="Machines"
        messages={resolveMessages()}
        announce={() => {}}
        footer="1 of 1"
        announcer={<output>said</output>}
      />,
    );
    const frame = container.firstElementChild;
    if (!(frame instanceof HTMLElement)) {
      throw new Error("expected the frame");
    }
    expect(frame).toHaveClass("ds", "data-table-frame");
    expect(Array.from(frame.children, (part) => part.tagName)).toEqual([
      "TABLE",
      "DIV",
      "OUTPUT",
    ]);
    expect(frame.children.item(1)).toHaveTextContent("1 of 1");
  });

  it.fails("writes its footer's measured height on the frame while it has one", () => {
    const standIn = installResizeObserverStandIn();
    onTestFinished(standIn.uninstall);
    const { provider } = createMachineProvider({ rows: [] });
    const draw = (footer: string | null) => (
      <ScopedDataTable
        settingsMenu={Menu}
        provider={provider}
        columns={columns}
        label="Machines"
        messages={resolveMessages()}
        announce={() => {}}
        footer={footer}
      />
    );
    const { container, rerender } = render(draw("1 of 1"));
    const frame = container.firstElementChild;
    const footer = frame?.querySelector(":scope > .footer");
    if (!(frame instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
      throw new Error("expected the frame and its footer");
    }
    act(() => standIn.resize(footer, 320, 41));
    expect(
      frame.style.getPropertyValue("--data-table-frame-footer-reserve"),
    ).toBe("41px");
    rerender(draw(null));
    expect(
      frame.style.getPropertyValue("--data-table-frame-footer-reserve"),
    ).toBe("");
  });

  it("takes the native props of its table, merging the class name, style and ref", () => {
    const { provider } = createMachineProvider({ rows: [] });
    const ref = createRef<HTMLTableElement>();
    render(
      <ScopedDataTable
        id="t"
        settingsMenu={Menu}
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
