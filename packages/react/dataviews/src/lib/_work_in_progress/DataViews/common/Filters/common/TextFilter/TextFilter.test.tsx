/**
 * One text filter, mounted on its own under a root: the input the wire
 * spells, the clear control and where focus goes after it, and typing as
 * one history step.
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
import createRecordingLocation from "../../../../../../../../testing/createRecordingLocation.js";
import { COUNTED_EXACTLY } from "../../../../../../../../testing/fixtures.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import DataViews from "../../../../Provider.js";
import { findFilterHandle } from "../../../utils/index.js";
import TextFilter from "./TextFilter.js";
import type { TextFilterProps } from "./types.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [{ field: "name", kind: "text" }],
});

const makeProvider = (location?: QueryLocation) =>
  createDataViewsProvider({
    collection,
    source: createManualSource<Row>({
      capabilities: declareCapabilities(collection, {
        filter: { name: true },
        counts: COUNTED_EXACTLY,
      }),
    }).source,
    ...(location === undefined ? {} : { location }),
  });

type Provider = ReturnType<typeof makeProvider>;

/** What a case sets; the handle, label and field are the harness's. */
type HarnessProps = Partial<
  Omit<TextFilterProps, "handle" | "label" | "field">
>;

/** The filter at the root's own handle for the name. */
const Harness = ({
  operator = "contains",
  declared = true,
  leavesWhenCleared = false,
  onLeave = () => {},
  ...rest
}: HarnessProps) => {
  const { filters } = useDataViewsRoot("TextFilter test");
  return (
    <TextFilter
      {...rest}
      handle={findFilterHandle<string>(filters, "name", operator)}
      operator={operator}
      label="name"
      field="name"
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

const adoptContains = (provider: Provider): void => {
  act(() => {
    readProviderHost(provider).adopt(
      {
        slice: {
          filter: [{ field: "name", operator: "contains", operands: ["web"] }],
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

describe("TextFilter", () => {
  it("is a text input named as the wire spells its operator", () => {
    mount(makeProvider(), { operator: "startsWith" });
    expect(
      screen.getByRole("textbox", { name: "name starts with" }),
    ).toHaveAttribute("name", "name__startsWith");
  });

  it("applies each edit, and keeps the text while the input is emptied", () => {
    const provider = makeProvider();
    mount(provider);
    const contains = screen.getByRole("textbox", { name: "name contains" });
    fireEvent.change(contains, { target: { value: "web" } });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "name", operator: "contains", operands: ["web"] },
    ]);
    fireEvent.change(contains, { target: { value: "" } });
    expect(provider.state.get().slice.filter).toHaveLength(1);
    expect(contains).toHaveAccessibleDescription(/Enter a value/);
  });

  it("clears the text, returning focus to the input that stays", () => {
    const provider = makeProvider();
    mount(provider);
    adoptContains(provider);
    fireEvent.click(
      screen.getByRole("button", { name: "Clear name contains" }),
    );
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(
      screen.getByRole("textbox", { name: "name contains" }),
    ).toHaveFocus();
  });

  it("offers undeclared text for removal only, then leaves with it", () => {
    const provider = makeProvider();
    const onLeave = vi.fn();
    mount(provider, { declared: false, leavesWhenCleared: true, onLeave });
    expect(screen.queryByRole("textbox")).toBeNull();
    adoptContains(provider);
    expect(
      screen.getByRole("textbox", { name: "name contains" }),
    ).toHaveAttribute("readonly");
    fireEvent.click(
      screen.getByRole("button", { name: "Clear name contains" }),
    );
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("takes the native props of its root, merging the class name", () => {
    const { container } = mount(makeProvider(), {
      className: "extra",
      title: "From the link",
    });
    const root = container.querySelector(".ds.data-views-filters-text");
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("title", "From the link");
  });

  it("types text as one history step, until the input is left", () => {
    const recorded = createRecordingLocation({ href: "/machines" });
    mount(makeProvider(recorded.location));
    const contains = screen.getByRole("textbox", { name: "name contains" });
    const before = recorded.writes.length;
    fireEvent.change(contains, { target: { value: "w" } });
    fireEvent.change(contains, { target: { value: "web" } });
    fireEvent.blur(contains);
    fireEvent.change(contains, { target: { value: "web-1" } });
    expect(recorded.writes.slice(before).map(([, mode]) => mode)).toEqual([
      "push",
      "replace",
      "push",
    ]);
  });
});
