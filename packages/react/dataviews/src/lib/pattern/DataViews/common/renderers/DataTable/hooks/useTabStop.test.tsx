/**
 * The table's tab index: predicted from the links the table draws before
 * the layout effect, then read from the committed markup on each change.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider } from "../../../../../../../../testing/index.js";
import type { DataTableColumn } from "../common/index.js";
import useTabStop from "./useTabStop.js";

const NAME: DataTableColumn = { id: "name", header: "Name" };
const DRAWN: DataTableColumn = {
  id: "name",
  header: "Name",
  cell: () => null,
};

/** A committed table with one header row and one empty cell. */
const drawTable = () => {
  const table = document.createElement("table");
  table.innerHTML =
    "<thead><tr><th>Name</th></tr></thead><tbody><tr><td></td></tr></tbody>";
  document.body.append(table);
  const cell = assertInvariant(table.querySelector("td"), "a drawn cell");
  const headerRow = { current: table.querySelector("tr") };
  return { table, cell, headerRow };
};

/** The hook over a fresh table, with each render's tab index in order. */
const mount = (
  columns: readonly DataTableColumn[],
  {
    located = false,
    arranged = false,
    sortable = false,
  }: {
    readonly located?: boolean;
    readonly arranged?: boolean;
    readonly sortable?: boolean;
  } = {},
) => {
  const { provider } = createMachineProvider(
    located ? { location: createMemoryLocation({ href: "/machines" }) } : {},
  );
  const drawn = drawTable();
  const renders: number[] = [];
  const hook = renderHook(() => {
    const tabIndex = useTabStop(
      provider,
      drawn.headerRow,
      columns,
      () => sortable,
      arranged,
    );
    renders.push(tabIndex);
    return tabIndex;
  });
  return { ...drawn, hook, renders };
};

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("useTabStop", () => {
  it.each([
    ["a location with settings", { located: true, arranged: true }, -1],
    ["a location with a sort", { located: true, sortable: true }, -1],
    ["a location alone", { located: true }, 0],
    [
      "settings and a sort with no location",
      { arranged: true, sortable: true },
      0,
    ],
  ])("predicts %s before the layout effect", (_, options, expected) => {
    expect(mount([NAME], options).renders.at(0)).toBe(expected);
  });

  it("predicts no link in a column's own content", () => {
    expect(mount([DRAWN], { located: true }).renders.at(0)).toBe(0);
  });

  it("measures the committed table after the layout effect", () => {
    const { hook, renders } = mount([NAME], { located: true, sortable: true });
    expect(renders.at(0)).toBe(-1);
    expect(hook.result.current).toBe(0);
  });

  it("flips when a child that takes focus is added or removed", async () => {
    const { cell, hook } = mount([NAME]);
    const button = document.createElement("button");
    act(() => cell.append(button));
    await waitFor(() => expect(hook.result.current).toBe(-1));
    act(() => button.remove());
    await waitFor(() => expect(hook.result.current).toBe(0));
  });

  it("flips when a watched attribute changes", async () => {
    const { cell, hook } = mount([NAME]);
    await act(async () => {
      cell.innerHTML = "<a>Open</a>";
    });
    expect(hook.result.current).toBe(0);
    const link = assertInvariant(cell.querySelector("a"), "the drawn link");
    act(() => link.setAttribute("href", "?page=2"));
    await waitFor(() => expect(hook.result.current).toBe(-1));
    act(() => link.setAttribute("tabindex", "-1"));
    await waitFor(() => expect(hook.result.current).toBe(0));
  });

  it("judges a table in a hidden wrapper within the table", () => {
    const { provider } = createMachineProvider();
    const { table, headerRow } = drawTable();
    const wrapper = document.createElement("div");
    wrapper.hidden = true;
    wrapper.append(table);
    document.body.append(wrapper);
    table.querySelector("th")?.append(document.createElement("button"));
    const hook = renderHook(() =>
      useTabStop(provider, headerRow, [NAME], () => true, false),
    );
    expect(hook.result.current).toBe(-1);
    act(() => wrapper.removeAttribute("hidden"));
    expect(hook.result.current).toBe(-1);
  });

  it("disconnects its observer on unmount", () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { hook } = mount([NAME]);
    expect(disconnect).not.toHaveBeenCalled();
    hook.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
