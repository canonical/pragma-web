import type { Query, SourceRefusal } from "@canonical/dataviews-core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../../../testing/buildMachine.js";
import buildPage from "../../../../../../testing/buildPage.js";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import type { MachineProvider } from "../../../../../../testing/types.js";
import ScopedRecordList from "./ScopedRecordList.js";
import type { RecordListOwnProps } from "./types.js";

const rows = [buildMachine("m-1", "alpha"), buildMachine("m-2", "beta")];

const nameRecord = (record: { readonly name: string }): string => record.name;

/** A sort refused while the index rebuilds. */
const rebuilding: SourceRefusal = {
  part: "sort",
  code: "unsupported-combination",
  field: "name",
  operator: null,
  reason: "the index is rebuilding",
};

/** The list over an observed provider, its rows delivered at once. */
const renderList = (
  props: Partial<RecordListOwnProps> = {},
  provider: MachineProvider = createMachineProvider({ rows }).provider,
) => {
  const stop = provider.observe();
  const view = render(
    <ScopedRecordList
      scope={provider}
      label="Machines"
      nameRecord={nameRecord}
      {...props}
    />,
  );
  return { provider, view, stop };
};

const region = () => within(screen.getByRole("region", { name: "Machines" }));

describe("ScopedRecordList", () => {
  it("lists the scope's rows, and says nothing while they speak for themselves", () => {
    renderList();
    expect(
      region()
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["alpha", "beta"]);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("says its status in place of the rows", () => {
    const { provider } = createMachineProvider();
    renderList({ messages: { statusPending: "Chargement…" } }, provider);
    expect(screen.getByRole("region", { name: "Machines" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(region().queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByRole("region", { name: "Machines" })).toHaveTextContent(
      "Chargement…",
    );
  });

  it("draws a checkbox per record when selectable", () => {
    const { provider } = renderList({ selectable: true });
    fireEvent.click(region().getByRole("checkbox", { name: "Select alpha" }));
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
  });

  it("sorts by the field it offers, and shows the direction applied", () => {
    const { provider } = renderList({
      sortBy: { field: "name", label: "Sort by name" },
    });
    const group = within(screen.getByRole("group", { name: "Sort by name" }));
    const ascending = group.getByRole("button", { name: "Sort ascending" });
    const descending = group.getByRole("button", { name: "Sort descending" });
    expect(ascending).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(descending);
    expect(provider.state.get().slice.sort).toEqual([
      { field: "name", direction: "desc" },
    ]);
    expect(descending).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(ascending);
    expect(ascending).toHaveAttribute("aria-pressed", "true");
    expect(group.getByRole("status")).toBeEmptyDOMElement();
  });

  it("offers no sort on a field the source cannot sort by", () => {
    renderList({ sortBy: { field: "status", label: "Sort by status" } });
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("says why the source refused a sort, and clears it once one applies", () => {
    let refusing = true;
    const { provider } = createMachineProvider({
      rows,
      refusals: (query: Query) =>
        refusing && query.slice.sort.length > 0 ? [rebuilding] : [],
    });
    renderList({ sortBy: { field: "name", label: "Sort by name" } }, provider);
    const group = within(screen.getByRole("group", { name: "Sort by name" }));
    fireEvent.click(group.getByRole("button", { name: "Sort ascending" }));
    expect(group.getByRole("status")).toHaveTextContent(
      "Sort unchanged: the index is rebuilding.",
    );
    expect(provider.state.get().slice.sort).toEqual([]);
    refusing = false;
    fireEvent.click(group.getByRole("button", { name: "Sort ascending" }));
    expect(group.getByRole("status")).toBeEmptyDOMElement();
  });

  it("keeps rows that a refresh failed to replace", () => {
    const { provider, source } = createMachineProvider();
    renderList({}, provider);
    act(() => {
      source.latest().deliver({ status: "succeeded", page: buildPage(rows) });
    });
    act(() => {
      provider.refresh();
    });
    act(() => {
      source.latest().deliver({
        status: "failed",
        failure: { reason: "offline", cause: null, transient: null },
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "These rows could not be refreshed: offline",
    );
    expect(region().getAllByRole("listitem")).toHaveLength(2);
  });
});
