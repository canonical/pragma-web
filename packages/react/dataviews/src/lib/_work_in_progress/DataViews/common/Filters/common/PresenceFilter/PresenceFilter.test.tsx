/**
 * One presence filter, mounted on its own under a root: the three radios
 * the wire spells, the count beside one, and the control leaving with the
 * last restriction it removes.
 */
import {
  type Count,
  createCollection,
  createDataViewsProvider,
  DEFAULT_WINDOW,
  declareCapabilities,
} from "@canonical/dataviews-core";
import {
  readProviderHost,
  spellWireValues,
} from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../../../../../../testing/createManualSource.js";
import { COUNTED_EXACTLY } from "../../../../../../../../testing/fixtures.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import DataViews from "../../../../Provider.js";
import { findFilterHandle } from "../../../utils/index.js";
import PresenceFilter from "./PresenceFilter.js";
import type { PresenceFilterProps } from "./types.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [{ field: "owner", kind: "presence" }],
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
  Omit<PresenceFilterProps, "handle" | "label" | "field">
>;

/** The filter at the root's own `owner` presence handle. */
const Harness = ({
  count = null,
  declared = true,
  onHold = () => {},
  ...rest
}: HarnessProps) => {
  const { filters } = useDataViewsRoot("PresenceFilter test");
  return (
    <PresenceFilter
      {...rest}
      handle={findFilterHandle<boolean>(filters, "owner", "isSet")}
      label="Owned"
      field="owner"
      count={count}
      declared={declared}
      onHold={onHold}
    />
  );
};

const mount = (provider: Provider, props: HarnessProps = {}) =>
  render(
    <DataViews provider={provider}>
      <Harness {...props} />
    </DataViews>,
  );

const setOwner = (provider: Provider, set = true): void => {
  act(() => {
    readProviderHost(provider).adopt(
      {
        slice: {
          filter: [{ field: "owner", operator: "isSet", operands: [set] }],
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

/** One of the group's radios, by its name. */
const findRadio = (name: string): HTMLElement =>
  screen.getByRole("radio", { name });

describe("PresenceFilter", () => {
  it("is a group of three choices named by the field, Any chosen", () => {
    mount(makeProvider());
    const group = screen.getByRole("group", { name: "Owned" });
    expect(group.tagName).toBe("FIELDSET");
    expect(
      screen.getAllByRole("radio").map((radio) => radio.getAttribute("value")),
    ).toEqual(["", "true", "false"]);
    expect(findRadio("Any")).toBeChecked();
  });

  it("applies either restriction, and removes it with Any", () => {
    const provider = makeProvider();
    mount(provider);
    fireEvent.click(findRadio("Has a value"));
    expect(provider.state.get().slice.filter).toEqual([
      { field: "owner", operator: "isSet", operands: [true] },
    ]);
    expect(findRadio("Has a value")).toBeChecked();
    fireEvent.click(findRadio("Has no value"));
    expect(provider.state.get().slice.filter).toEqual([
      { field: "owner", operator: "isSet", operands: [false] },
    ]);
    expect(findRadio("Has no value")).toBeChecked();
    fireEvent.click(findRadio("Any"));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(findRadio("Any")).toBeChecked();
  });

  it("names each radio as the wire spells presence, with the encoder's value", () => {
    // The values the encoder writes for each operand, and none for Any.
    mount(makeProvider());
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("name", "owner__isSet");
    }
    expect(
      screen.getAllByRole("radio").map((radio) => radio.getAttribute("value")),
    ).toEqual([
      "",
      ...spellWireValues({
        field: "owner",
        operator: "isSet",
        operands: [true],
      }),
      ...spellWireValues({
        field: "owner",
        operator: "isSet",
        operands: [false],
      }),
    ]);
  });

  it("describes Has a value by how many matching records hold one", () => {
    const count: Count = { kind: "at-least", value: 1200 };
    mount(makeProvider(), { count });
    expect(findRadio("Has a value")).toHaveAccessibleDescription(
      "at least 1,200",
    );
    expect(findRadio("Has no value")).not.toHaveAttribute("aria-describedby");
  });

  it("says no count while none answers, or the source cannot count", () => {
    const { rerender } = mount(makeProvider());
    expect(findRadio("Has a value")).not.toHaveAttribute("aria-describedby");
    rerender(
      <DataViews provider={makeProvider()}>
        <Harness count={{ kind: "unknown" }} />
      </DataViews>,
    );
    expect(findRadio("Has a value")).not.toHaveAttribute("aria-describedby");
  });

  it("offers an undeclared field only while it stands, for removal only", () => {
    const provider = makeProvider();
    mount(provider, { declared: false });
    expect(screen.queryByRole("radio")).toBeNull();
    setOwner(provider, false);
    // Only for removal: the other restriction was never offered.
    expect(findRadio("Has a value")).toBeDisabled();
    expect(findRadio("Has no value")).toBeEnabled();
    fireEvent.click(findRadio("Any"));
    expect(provider.state.get().slice.filter).toEqual([]);
    // Nothing held focus inside it, so it leaves with the restriction.
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("stays while focus is inside it once Any removes an undeclared field, and leaves after", () => {
    const provider = makeProvider();
    const onHold = vi.fn();
    mount(provider, { declared: false, onHold });
    setOwner(provider, false);
    const unset = findRadio("Has no value");
    act(() => {
      unset.focus();
    });
    expect(onHold).toHaveBeenLastCalledWith(true);
    // An arrow key moving to Any chooses it, as the browser does.
    act(() => {
      findRadio("Any").focus();
    });
    fireEvent.click(findRadio("Any"));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(findRadio("Any")).toHaveFocus();
    expect(findRadio("Any")).toBeChecked();
    expect(onHold).not.toHaveBeenCalledWith(false);
    act(() => {
      findRadio("Any").blur();
    });
    expect(onHold).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("keeps focus where it is when the control stays after a clear", () => {
    const provider = makeProvider();
    mount(provider);
    setOwner(provider);
    act(() => {
      findRadio("Any").focus();
    });
    fireEvent.click(findRadio("Any"));
    expect(screen.getByRole("group", { name: "Owned" })).toBeInTheDocument();
    expect(findRadio("Any")).toHaveFocus();
  });

  it("takes the native props of its root, merging the class name", () => {
    const { container } = mount(makeProvider(), {
      className: "extra",
      title: "Machines with an owner",
    });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("FIELDSET");
    expect(root).toHaveClass("ds", "data-views-filters-presence", "extra");
    expect(root).toHaveAttribute("title", "Machines with an owner");
  });
});
