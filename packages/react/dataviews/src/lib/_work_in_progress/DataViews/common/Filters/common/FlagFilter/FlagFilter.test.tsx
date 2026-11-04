/**
 * One presence filter, mounted on its own under a root: the checkbox the
 * wire spells, the count beside it, and the control leaving with the last
 * restriction it removes.
 */
import {
  type Count,
  createCollection,
  createDataViewsProvider,
  DEFAULT_WINDOW,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../../../../../../testing/createManualSource.js";
import { COUNTED_EXACTLY } from "../../../../../../../../testing/fixtures.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import DataViews from "../../../../Provider.js";
import { findFilterHandle } from "../../../utils/index.js";
import FlagFilter from "./FlagFilter.js";
import type { FlagFilterProps } from "./types.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [{ field: "owner", kind: "flag" }],
});

const makeProvider = () =>
  createDataViewsProvider({
    collection,
    source: createManualSource<Row>({
      capabilities: declareCapabilities(collection, {
        filter: { owner: true },
        counts: COUNTED_EXACTLY,
      }),
    }).source,
  });

type Provider = ReturnType<typeof makeProvider>;

/** What a case sets; the handle, label and field are the harness's. */
type HarnessProps = Partial<
  Omit<FlagFilterProps, "handle" | "label" | "field">
>;

/** The filter at the root's own `owner` presence handle. */
const Harness = ({
  count = null,
  declared = true,
  leavesWhenCleared = false,
  onLeave = () => {},
  ...rest
}: HarnessProps) => {
  const { filters } = useDataViewsRoot("FlagFilter test");
  return (
    <FlagFilter
      {...rest}
      handle={findFilterHandle<boolean>(filters, "owner", "isSet")}
      label="Owned"
      field="owner"
      count={count}
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

const setOwner = (provider: Provider): void => {
  act(() => {
    readProviderHost(provider).adopt(
      {
        slice: {
          filter: [{ field: "owner", operator: "isSet", operands: [] }],
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

describe("FlagFilter", () => {
  it("applies the presence predicate when checked, and removes it when unchecked", () => {
    const provider = makeProvider();
    mount(provider);
    const owned = screen.getByRole("checkbox", { name: "Owned" });
    expect(owned).not.toBeChecked();
    fireEvent.click(owned);
    expect(provider.state.get().slice.filter).toEqual([
      { field: "owner", operator: "isSet", operands: [] },
    ]);
    expect(owned).toBeChecked();
    fireEvent.click(owned);
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("names the checkbox as the wire spells presence, with the encoder's marker", () => {
    mount(makeProvider());
    const owned = screen.getByRole("checkbox", { name: "Owned" });
    expect(owned).toHaveAttribute("name", "owner__isSet");
    expect(owned).toHaveAttribute("value", "1");
  });

  it("describes the checkbox by how many matching records set the field", () => {
    const count: Count = { kind: "at-least", value: 1200 };
    mount(makeProvider(), { count });
    expect(
      screen.getByRole("checkbox", { name: "Owned" }),
    ).toHaveAccessibleDescription("at least 1,200");
  });

  it("says no count while none answers, or the source cannot count", () => {
    const { rerender } = mount(makeProvider());
    const owned = screen.getByRole("checkbox", { name: "Owned" });
    expect(owned).not.toHaveAttribute("aria-describedby");
    rerender(
      <DataViews provider={makeProvider()}>
        <Harness count={{ kind: "unknown" }} />
      </DataViews>,
    );
    expect(screen.getByRole("checkbox", { name: "Owned" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("offers an undeclared field only while it stands, then leaves with it", () => {
    const provider = makeProvider();
    const onLeave = vi.fn();
    mount(provider, { declared: false, leavesWhenCleared: true, onLeave });
    expect(screen.queryByRole("checkbox")).toBeNull();
    setOwner(provider);
    fireEvent.click(screen.getByRole("checkbox", { name: "Owned" }));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("keeps focus where it is when the control stays after a clear", () => {
    const provider = makeProvider();
    const onLeave = vi.fn();
    mount(provider, { onLeave });
    setOwner(provider);
    fireEvent.click(screen.getByRole("checkbox", { name: "Owned" }));
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("takes the native props of its root, merging the class name", () => {
    const { container } = mount(makeProvider(), {
      className: "extra",
      title: "Machines with an owner",
    });
    const root = container.firstElementChild;
    expect(root).toHaveClass("ds", "data-views-filters-flag", "extra");
    expect(root).toHaveAttribute("title", "Machines with an owner");
  });
});
