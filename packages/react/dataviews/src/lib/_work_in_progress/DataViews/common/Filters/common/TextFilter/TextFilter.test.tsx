/**
 * One text filter, mounted on its own under a root: the input the wire
 * spells, the choice of how it matches, the clear control and where focus
 * goes after it, and typing as one history step.
 */
import {
  createCollection,
  createDataViewsProvider,
  DEFAULT_WINDOW,
  declareCapabilities,
  type Predicate,
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
import type { TextFilterOperator, TextFilterProps } from "./types.js";

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
        filter: { name: ["is", "contains", "endsWith"] },
        counts: COUNTED_EXACTLY,
      }),
    }).source,
    ...(location === undefined ? {} : { location }),
  });

type Provider = ReturnType<typeof makeProvider>;

/** What a case sets; the handles, label, field and host are the harness's. */
type HarnessProps = Partial<
  Omit<TextFilterProps, "findHandle" | "label" | "field" | "host">
>;

/** The filter over the root's own handles for the name. */
const Harness = ({
  standing = null,
  offered = ["is", "contains", "endsWith"],
  taken = [],
  leavesWhenCleared = false,
  onLeave = () => {},
  onMoved = () => {},
  takeMoved = () => false,
  ...rest
}: HarnessProps) => {
  const { filters, provider } = useDataViewsRoot("TextFilter test");
  return (
    <TextFilter
      {...rest}
      standing={standing}
      offered={offered}
      taken={taken}
      findHandle={(operator) =>
        findFilterHandle<string>(filters, "name", operator)
      }
      label="name"
      field="name"
      host={readProviderHost(provider)}
      leavesWhenCleared={leavesWhenCleared}
      onLeave={onLeave}
      onMoved={onMoved}
      takeMoved={takeMoved}
    />
  );
};

const mount = (provider: Provider, props: HarnessProps = {}) =>
  render(
    <DataViews provider={provider}>
      <Harness {...props} />
    </DataViews>,
  );

const adopt = (provider: Provider, filter: readonly Predicate[]): void => {
  act(() => {
    readProviderHost(provider).adopt(
      {
        slice: { filter, search: null, sort: [], group: [] },
        window: DEFAULT_WINDOW,
      },
      "adopt",
      null,
    );
  });
};

const nameOf = (operator: TextFilterOperator, text: string): Predicate => ({
  field: "name",
  operator,
  operands: [text],
});

describe("TextFilter", () => {
  it("starts on contains, its input named as the wire spells it", () => {
    mount(makeProvider());
    expect(
      screen.getByRole("textbox", { name: "name contains" }),
    ).toHaveAttribute("name", "name__contains");
  });

  it("starts on the first declared operator where contains is not one", () => {
    mount(makeProvider(), { offered: ["is", "endsWith"] });
    expect(screen.getByRole("textbox", { name: "name is" })).toHaveAttribute(
      "name",
      "name__is",
    );
  });

  it("offers no choice where one operator is declared", () => {
    mount(makeProvider(), { offered: ["endsWith"] });
    expect(
      screen.getByRole("textbox", { name: "name ends with" }),
    ).toBeVisible();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("chooses how the text matches among the declared operators", () => {
    const provider = makeProvider();
    mount(provider);
    const select = screen.getByRole("combobox", { name: "How name matches" });
    expect(
      [...(select as HTMLSelectElement).options].map(({ text }) => text),
    ).toEqual(["name is", "name contains", "name ends with"]);
    fireEvent.change(select, { target: { value: "endsWith" } });
    expect(
      screen.getByRole("textbox", { name: "name ends with" }),
    ).toHaveAttribute("name", "name__endsWith");
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("matches typed text by the operator last chosen", () => {
    const provider = makeProvider();
    mount(provider);
    const select = screen.getByRole("combobox", { name: "How name matches" });
    fireEvent.change(select, { target: { value: "endsWith" } });
    fireEvent.change(select, { target: { value: "is" } });
    fireEvent.change(screen.getByRole("textbox", { name: "name is" }), {
      target: { value: "web" },
    });
    expect(provider.state.get().slice.filter).toEqual([nameOf("is", "web")]);
  });

  it("moves standing text to the operator chosen, as one step", () => {
    const recorded = createRecordingLocation({ href: "/m?name__is=web" });
    const provider = makeProvider(recorded.location);
    const { rerender } = mount(provider, {
      standing: "is",
      taken: ["endsWith"],
    });
    adopt(provider, [nameOf("is", "web"), nameOf("endsWith", "01")]);
    const select = screen.getByRole("combobox", { name: "How name matches" });
    const endsWith = [...(select as HTMLSelectElement).options].find(
      ({ value }) => value === "endsWith",
    );
    // Another control edits it, so this one cannot take it.
    expect(endsWith).toHaveProperty("disabled", true);
    const before = recorded.writes.length;
    fireEvent.change(select, { target: { value: "contains" } });
    expect(provider.state.get().slice.filter).toEqual([
      nameOf("endsWith", "01"),
      nameOf("contains", "web"),
    ]);
    expect(recorded.writes.length - before).toBe(1);
    rerender(
      <DataViews provider={provider}>
        <Harness standing="contains" taken={["endsWith"]} />
      </DataViews>,
    );
    expect(screen.getByRole("textbox", { name: "name contains" })).toHaveValue(
      "web",
    );
  });

  it("says where standing text moves, and takes focus when text moved to it", () => {
    const provider = makeProvider();
    const onMoved = vi.fn();
    mount(provider, { standing: "is", onMoved, takeMoved: () => true });
    adopt(provider, [nameOf("is", "web")]);
    const select = screen.getByRole("combobox", { name: "How name matches" });
    expect(select).toHaveFocus();
    fireEvent.change(select, { target: { value: "endsWith" } });
    expect(onMoved).toHaveBeenCalledWith("endsWith");
  });

  it("applies each edit, and keeps the text while the input is emptied", () => {
    const provider = makeProvider();
    mount(provider);
    const input = screen.getByRole("textbox", { name: "name contains" });
    fireEvent.change(input, { target: { value: "web" } });
    expect(provider.state.get().slice.filter).toEqual([
      nameOf("contains", "web"),
    ]);
    fireEvent.change(input, { target: { value: "" } });
    expect(provider.state.get().slice.filter).toHaveLength(1);
    expect(input).toHaveAccessibleDescription(/Enter a value/);
  });

  it("clears the text, returning focus to the input that stays", () => {
    const provider = makeProvider();
    mount(provider, { standing: "contains" });
    adopt(provider, [nameOf("contains", "web")]);
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
    mount(provider, { standing: "isNot", leavesWhenCleared: true, onLeave });
    adopt(provider, [nameOf("isNot", "web")]);
    expect(
      screen.getByRole("textbox", { name: "name is not" }),
    ).toHaveAttribute("readonly");
    expect(screen.queryByRole("combobox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear name is not" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("refuses to render with no operator to edit", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => mount(makeProvider(), { offered: [] })).toThrow(
      'text field "name" has no operator to edit',
    );
    vi.restoreAllMocks();
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
    const input = screen.getByRole("textbox", { name: "name contains" });
    const before = recorded.writes.length;
    fireEvent.change(input, { target: { value: "w" } });
    fireEvent.change(input, { target: { value: "web" } });
    fireEvent.blur(input);
    fireEvent.change(input, { target: { value: "web-1" } });
    expect(recorded.writes.slice(before).map(([, mode]) => mode)).toEqual([
      "push",
      "replace",
      "push",
    ]);
  });
});
