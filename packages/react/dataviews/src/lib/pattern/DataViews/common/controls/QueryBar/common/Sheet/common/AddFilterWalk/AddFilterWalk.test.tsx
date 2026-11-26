/**
 * "Add filter": field, operator and value walked as lists, the filter
 * added once complete, Back and Escape leaving step by step.
 */
import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  createPage,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { createManualSource } from "@canonical/dataviews-core/testing";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { createMachineProvider } from "../../../../../../../../../../../testing/index.js";
import Context from "../../../../../../../../../_work_in_progress/DataViews/Context.js";
import { useDataViewsRoot } from "../../../../../../../../../_work_in_progress/DataViews/hooks/index.js";
import DataViews from "../../../../../../../../../_work_in_progress/DataViews/Provider.js";
import { useQueryGroup } from "../../../../hooks/index.js";
import type { QueryGroupStandIn } from "../../../../types.js";
import AddFilterWalk from "./AddFilterWalk.js";

type MountConfig = {
  readonly query?: string;
  readonly alter?: (group: QueryGroupStandIn) => QueryGroupStandIn;
  readonly provider?: ReturnType<typeof createMachineProvider>["provider"];
};

/** The walk inside a dialog, over the machines or a given provider. */
const mount = ({ query, alter, provider: given }: MountConfig = {}) => {
  const provider =
    given ??
    createMachineProvider(
      query === undefined ? {} : { snapshot: { query, presentation: {} } },
    ).provider;
  const announce = vi.fn();
  const announceOutcome = vi.fn();
  const onAdded = vi.fn();
  function Harness(): ReactElement {
    const group = useQueryGroup({ provider: provider as never });
    const root = useDataViewsRoot("QueryBar");
    // The sheet's context, whose announcer is its own region.
    return (
      <Context value={{ ...root, announce }}>
        <AddFilterWalk
          group={alter === undefined ? group : alter(group)}
          announceOutcome={announceOutcome}
          onAdded={onAdded}
        />
      </Context>
    );
  }
  const view = render(
    <DataViews provider={provider}>
      <dialog open>
        <Harness />
      </dialog>
    </DataViews>,
  );
  const dialog = view.container.querySelector("dialog") as HTMLDialogElement;
  return { provider, announce, announceOutcome, onAdded, dialog };
};

const findOption = (name: string | RegExp) =>
  screen.getByRole("option", { name });
const press = (element: Element, key: string) =>
  fireEvent.keyDown(element, { key });
const openWalk = () =>
  fireEvent.click(screen.getByRole("button", { name: "Add filter" }));
const readFilter = (provider: MountConfig["provider"]) =>
  provider?.state.get().slice.filter;

describe("AddFilterWalk", () => {
  it("walks field, operator and values by keys, and adds one filter", () => {
    const { provider, announce, announceOutcome, onAdded } = mount();
    openWalk();
    const fields = screen.getByRole("listbox", { name: "Choose a field" });
    expect(fields).toBeInTheDocument();
    expect(findOption("status")).toHaveFocus();
    press(findOption("status"), "Enter");
    expect(announce).toHaveBeenLastCalledWith(
      "status chosen. Choose an operator for status.",
    );
    expect(
      screen.getByRole("listbox", { name: "Choose an operator for status" }),
    ).toBeInTheDocument();
    expect(findOption(/^is any of/)).toHaveFocus();
    press(findOption(/^is any of/), "Enter");
    expect(announce).toHaveBeenLastCalledWith(
      "is any of chosen. Choose a value for status.",
    );
    const values = screen.getByRole("listbox", {
      name: "Choose a value for status",
    });
    expect(values).toHaveAttribute("aria-multiselectable", "true");
    expect(findOption("failed")).toHaveFocus();
    press(findOption("failed"), " ");
    press(findOption("failed"), "ArrowDown");
    press(findOption("running"), " ");
    expect(findOption("failed")).toHaveAttribute("aria-selected", "true");
    expect(findOption("running")).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(readFilter(provider)).toEqual([
      { field: "status", operator: "isAny", operands: ["failed", "running"] },
    ]);
    expect(onAdded).toHaveBeenCalledWith("status__isAny__0");
    const words = announceOutcome.mock.calls.at(0)?.[0];
    expect(words({ kind: "exact", value: 2 })).toBe(
      "Added status is any of failed, running. 2 records.",
    );
    // The walk is closed, and leaves focus to the sheet.
    expect(
      screen.getByRole("button", { name: "Add filter" }),
    ).not.toHaveFocus();
  });

  it("says a choice's values must be chosen before Add", () => {
    const { announce, provider } = mount();
    openWalk();
    press(findOption("status"), "Enter");
    press(findOption(/^is any of/), "Enter");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("listbox")).toHaveAccessibleDescription(
      "Enter a value to apply this restriction.",
    );
    expect(announce).toHaveBeenLastCalledWith(
      "Enter a value to apply this restriction.",
    );
    expect(readFilter(provider)).toEqual([]);
    // Toggling a value clears it.
    press(findOption("failed"), " ");
    expect(screen.getByRole("listbox")).not.toHaveAccessibleDescription();
  });

  it("takes a typed value in a labelled input, invalid until it reads", () => {
    const { provider, onAdded } = mount();
    openWalk();
    press(findOption("cores"), "Enter");
    press(findOption(/^at least/), "Enter");
    const input = screen.getByRole("textbox", { name: "Value for cores" });
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription("Number");
    fireEvent.change(input, { target: { value: "lots" } });
    press(input, "Enter");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/^Number Invalid: /);
    fireEvent.change(input, { target: { value: "" } });
    expect(input).not.toHaveAttribute("aria-invalid");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(input).toHaveAccessibleDescription(
      "Number Enter a value to apply this restriction.",
    );
    fireEvent.change(input, { target: { value: "4" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(readFilter(provider)).toEqual([]);
    press(input, "a");
    press(input, "Enter");
    expect(readFilter(provider)).toEqual([
      { field: "cores", operator: "gte", operands: [4] },
    ]);
    expect(onAdded).toHaveBeenCalledWith("cores__gte__0");
  });

  it("hands on the range a bound joins", () => {
    const { onAdded } = mount({ query: "cores__lte=8" });
    openWalk();
    press(findOption("cores"), "Enter");
    press(findOption(/^at least/), "Enter");
    const input = screen.getByRole("textbox", { name: "Value for cores" });
    fireEvent.change(input, { target: { value: "2" } });
    press(input, "Enter");
    expect(onAdded).toHaveBeenCalledWith("cores__range");
  });

  it("hands on its own chip where a range on its field stands apart", () => {
    const { onAdded } = mount({ query: "cores__gte=2&cores__lte=8" });
    openWalk();
    press(findOption("cores"), "Enter");
    press(findOption(/^at least/), "Enter");
    const input = screen.getByRole("textbox", { name: "Value for cores" });
    fireEvent.change(input, { target: { value: "4" } });
    press(input, "Enter");
    expect(onAdded).toHaveBeenCalledWith("cores__gte__1");
  });

  it("writes nothing for a filter the query holds, handing on its chip", () => {
    const { provider, onAdded, announceOutcome } = mount({
      query: "status=failed",
    });
    const before = provider.state.get().slice;
    openWalk();
    press(findOption("status"), "Enter");
    press(findOption(/^is any of/), "Enter");
    press(findOption("failed"), "Enter");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(provider.state.get().slice).toBe(before);
    expect(announceOutcome).not.toHaveBeenCalled();
    expect(onAdded).toHaveBeenCalledWith("status__isAny__0");
  });

  it("says why the source refused the filter, and stays open", () => {
    const { announce } = mount({
      alter: (group) => ({
        ...group,
        addPredicate: () => [{ reason: "too many filters" } as never],
      }),
    });
    openWalk();
    press(findOption("status"), "Enter");
    press(findOption(/^is any of/), "Enter");
    press(findOption("failed"), " ");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(announce).toHaveBeenLastCalledWith(
      expect.stringContaining("Too many filters"),
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("hands on the range an upper bound joins", () => {
    const { onAdded } = mount({ query: "cores__gte=2" });
    openWalk();
    press(findOption("cores"), "Enter");
    press(findOption(/^at most/), "Enter");
    const input = screen.getByRole("textbox", { name: "Value for cores" });
    fireEvent.change(input, { target: { value: "8" } });
    press(input, "Enter");
    expect(onAdded).toHaveBeenCalledWith("cores__range");
  });

  it("takes text in an input with no format to describe", () => {
    const collection = createCollection({
      identify: (host: { readonly id: string; readonly name: string }) =>
        host.id,
      fields: [{ field: "name", kind: "text" }],
    });
    const provider = createDataViewsProvider({
      collection,
      source: createArraySource({
        rows: [{ id: "h1", name: "web-1" }],
        collection,
        searchFields: ["name"],
      }),
    });
    const { onAdded } = mount({ provider: provider as never });
    openWalk();
    press(findOption("name"), "Enter");
    press(findOption(/^contains/), "Enter");
    const input = screen.getByRole("textbox", { name: "Value for name" });
    expect(input).not.toHaveAttribute("aria-describedby");
    fireEvent.change(input, { target: { value: "web" } });
    press(input, "Enter");
    expect(provider.state.get().slice.filter).toEqual([
      { field: "name", operator: "contains", operands: ["web"] },
    ]);
    expect(onAdded).toHaveBeenCalledWith("name__contains__0");
  });

  it("says a choice's server options are loading, then offers them as they land", () => {
    const collection = createCollection({
      identify: (host: { readonly id: string; readonly pool: string }) =>
        host.id,
      fields: [{ field: "pool", kind: "choices" }],
    });
    const source = createManualSource<{
      readonly id: string;
      readonly pool: string;
    }>({
      capabilities: declareCapabilities(collection, {
        filter: { pool: ["isAny"] },
        facets: ["pool"],
      }),
    });
    const provider = createDataViewsProvider({
      collection,
      source: source.source,
      facets: ["pool"],
    });
    mount({ provider: provider as never });
    openWalk();
    press(findOption("pool"), "Enter");
    press(findOption(/^is any of/), "Enter");
    const values = screen.getByRole("listbox", {
      name: "Choose a value for pool",
    });
    expect(values).toHaveAttribute("aria-busy", "true");
    expect(values).toHaveAccessibleDescription("Loading suggestions");
    expect(values).toHaveFocus();
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: {
          ...createPage({ rows: [{ id: "h1", pool: "gpu" }], matched: 1 }),
          facets: {
            pool: {
              kind: "values",
              values: [{ value: "gpu", count: { kind: "exact", value: 1 } }],
            },
          },
        },
      });
    });
    expect(values).not.toHaveAttribute("aria-busy");
    expect(findOption(/^gpu/)).toHaveFocus();
  });

  it("adds presence at its operator, which brings its value", () => {
    const collection = createCollection({
      identify: (host: { readonly id: string; readonly owner?: string }) =>
        host.id,
      fields: [{ field: "owner", kind: "presence" }],
    });
    const provider = createDataViewsProvider({
      collection,
      source: createArraySource({ rows: [{ id: "h1" }], collection }),
    });
    const { onAdded } = mount({ provider: provider as never });
    openWalk();
    press(findOption("owner"), "Enter");
    press(findOption("has no value"), "Enter");
    expect(provider.state.get().slice.filter).toEqual([
      { field: "owner", operator: "isSet", operands: [false] },
    ]);
    expect(onAdded).toHaveBeenCalledWith("owner__isSet__0");
  });

  it("chooses the same field again after Back, its operator kept", () => {
    mount();
    openWalk();
    press(findOption("status"), "Enter");
    press(findOption(/^is any of/), "Enter");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    const status = findOption("status");
    expect(status).toHaveAttribute("aria-selected", "true");
    expect(status).not.toHaveAttribute("aria-disabled");
    expect(status).toHaveFocus();
    press(status, "Enter");
    expect(
      screen.getByRole("listbox", { name: "Choose an operator for status" }),
    ).toBeInTheDocument();
    expect(findOption(/^is any of/)).toHaveAttribute("aria-selected", "true");
  });

  it("goes back a step, showing what was chosen, and leaves from the first", () => {
    const { announce } = mount();
    openWalk();
    expect(announce).toHaveBeenLastCalledWith("Choose a field");
    press(findOption("status"), "Enter");
    press(findOption(/^is any of/), "Enter");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(announce).toHaveBeenLastCalledWith("Choose an operator for status");
    expect(findOption(/^is any of/)).toHaveAttribute("aria-selected", "true");
    expect(findOption(/^is any of/)).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(announce).toHaveBeenLastCalledWith("Choose a field");
    expect(findOption("status")).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: "Add filter" })).toHaveFocus();
  });

  it("leaves on Escape, the key's default prevented so the sheet stays", () => {
    mount();
    openWalk();
    press(findOption("status"), "Enter");
    expect(press(findOption(/^is any of/), "Escape")).toBe(false);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: "Add filter" })).toHaveFocus();
  });

  it("cancels the dialog's close request while open, and leaves", () => {
    const { dialog } = mount();
    const idle = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(idle);
    expect(idle.defaultPrevented).toBe(false);
    openWalk();
    const request = new Event("cancel", { cancelable: true });
    act(() => {
      dialog.dispatchEvent(request);
    });
    expect(request.defaultPrevented).toBe(true);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: "Add filter" })).toHaveFocus();
  });

  it("listens for no close request outside a dialog", () => {
    const { provider } = createMachineProvider();
    function Harness(): ReactElement {
      const group = useQueryGroup({ provider: provider as never });
      return (
        <AddFilterWalk
          group={group}
          announceOutcome={() => {}}
          onAdded={() => {}}
        />
      );
    }
    render(
      <DataViews provider={provider}>
        <Harness />
      </DataViews>,
    );
    openWalk();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
