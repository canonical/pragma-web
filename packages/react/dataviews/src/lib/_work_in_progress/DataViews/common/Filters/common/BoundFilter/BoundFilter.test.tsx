/**
 * One bound of a number or date field, mounted on its own under a root:
 * the native input the wire spells, the hint a facet offers, the clear
 * control and where focus goes after it, and typing as one history step.
 */
import {
  createCollection,
  createDataViewsProvider,
  DEFAULT_WINDOW,
  declareCapabilities,
  type QueryLocation,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../../../../../../testing/createManualSource.js";
import { COUNTED_EXACTLY } from "../../../../../../../../testing/fixtures.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import DataViews from "../../../../Provider.js";
import { findFilterHandle } from "../../../utils/index.js";
import BoundFilter from "./BoundFilter.js";
import type { BoundFilterProps } from "./types.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [
    { field: "cpu", kind: "number", min: 0, max: 64 },
    { field: "updated", kind: "date" },
  ],
});

const makeProvider = (location?: QueryLocation) =>
  createDataViewsProvider({
    collection,
    source: createManualSource<Row>({
      capabilities: declareCapabilities(collection, {
        filter: { cpu: true, updated: true },
        counts: COUNTED_EXACTLY,
      }),
    }).source,
    ...(location === undefined ? {} : { location }),
  });

type Provider = ReturnType<typeof makeProvider>;

/** What a case sets; the handle, label and definition follow the field. */
type HarnessProps = Partial<
  Omit<BoundFilterProps, "handle" | "label" | "definition">
> & { readonly field?: "cpu" | "updated" };

/** The bound at the root's own handle for the field. */
const Harness = ({
  field = "cpu",
  bound = "gte",
  offered = null,
  declared = true,
  leavesWhenCleared = false,
  onLeave = () => {},
  ...rest
}: HarnessProps) => {
  const { filters } = useDataViewsRoot("BoundFilter test");
  const definition = collection.schema.findField(field);
  if (definition?.kind !== "number" && definition?.kind !== "date") {
    throw new Error(`expected a bound field, not ${field}`);
  }
  return (
    <BoundFilter
      {...rest}
      handle={findFilterHandle<number | string>(filters, field, bound)}
      label={field}
      bound={bound}
      definition={definition}
      offered={offered}
      declared={declared}
      leavesWhenCleared={leavesWhenCleared}
      onLeave={onLeave}
    />
  );
};

const mount = (provider: Provider, props: HarnessProps = {}) =>
  render(
    <DataViews provider={provider}>
      <Harness {...props} />
    </DataViews>,
  );

const adoptLowerBound = (provider: Provider): void => {
  act(() => {
    readProviderHost(provider).adopt(
      {
        slice: {
          filter: [{ field: "cpu", operator: "gte", operands: [4] }],
          search: null,
          sort: [],
          group: [],
        },
        window: DEFAULT_WINDOW,
      },
      "adopt",
      null,
    );
  });
};

describe("BoundFilter", () => {
  it("is a native number input carrying the schema's bounds, named as the wire spells it", () => {
    mount(makeProvider());
    const from = screen.getByRole("spinbutton", { name: "cpu from" });
    expect(from).toHaveAttribute("min", "0");
    expect(from).toHaveAttribute("max", "64");
    expect(from).toHaveAttribute("name", "cpu__gte");
  });

  it("is a native date input for a date field's upper bound", () => {
    const { container } = mount(makeProvider(), {
      field: "updated",
      bound: "lte",
    });
    const to = screen.getByLabelText("updated to");
    expect(to).toHaveAttribute("type", "date");
    expect(to).toHaveAttribute("name", "updated__lte");
    expect(container.querySelector("[min]")).toBeNull();
  });

  it("applies each edit, and keeps the bound while the input is emptied", () => {
    const provider = makeProvider();
    mount(provider);
    const from = screen.getByRole("spinbutton", { name: "cpu from" });
    fireEvent.change(from, { target: { value: "4" } });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
    ]);
    fireEvent.change(from, { target: { value: "" } });
    expect(provider.state.get().slice.filter).toHaveLength(1);
    expect(from).toHaveAccessibleDescription(/Enter a value/);
  });

  it("offers the facet's value for the bound beside the input", () => {
    mount(makeProvider(), { offered: 2 });
    expect(
      screen.getByRole("spinbutton", { name: "cpu from" }),
    ).toHaveAccessibleDescription("Lowest: 2");
  });

  it("clears the bound, returning focus to the input that stays", () => {
    const provider = makeProvider();
    mount(provider);
    adoptLowerBound(provider);
    fireEvent.click(screen.getByRole("button", { name: "Clear cpu from" }));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(screen.getByRole("spinbutton", { name: "cpu from" })).toHaveFocus();
  });

  it("offers an undeclared bound for removal only, then leaves with it", () => {
    const provider = makeProvider();
    const onLeave = vi.fn();
    mount(provider, { declared: false, leavesWhenCleared: true, onLeave });
    expect(screen.queryByRole("spinbutton")).toBeNull();
    adoptLowerBound(provider);
    expect(
      screen.getByRole("spinbutton", { name: "cpu from" }),
    ).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Clear cpu from" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("takes the native props of its root, merging the class name", () => {
    const { container } = mount(makeProvider(), {
      className: "extra",
      title: "From the link",
    });
    const root = container.querySelector(".ds.data-views-filters-bound");
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("title", "From the link");
  });
});
