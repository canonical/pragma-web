/**
 * The query bar over a small collection of one field of each kind: building,
 * editing and removing chips by keys and by pointer, the search, the clear
 * control, what it says, and what it re-renders.
 */
import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  declareCapabilities,
  type QueryLocation,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import createManualSource from "../../../../../../testing/createManualSource.js";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import DataViews from "../../Provider.js";
import QueryBar from "./QueryBar.js";

/** Every render of a chip, by its id: the render-count test reads them. */
const chipRenders = vi.hoisted(() => [] as string[]);
vi.mock("./common/DraftChip/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./common/DraftChip/index.js")>();
  return {
    ...actual,
    DraftChip: (props: Parameters<typeof actual.DraftChip>[0]) => {
      chipRenders.push(props.id);
      return actual.DraftChip(props);
    },
  };
});

// Every render of the bar's field: the bar renders it whenever it renders.
vi.mock("../../../QueryInput/index.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../QueryInput/index.js")>();
  return {
    ...actual,
    QueryInput: (props: Parameters<typeof actual.QueryInput>[0]) => {
      chipRenders.push("bar");
      return actual.QueryInput(props);
    },
  };
});

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** One record of the collection. */
type Host = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly pool: string;
  readonly memory: number;
  readonly owner?: string;
  readonly seen: string;
};

const collection = createCollection({
  identify: (host: Host) => host.id,
  fields: [
    {
      field: "status",
      kind: "choices",
      options: ["deployed", "ready", "broken"],
    },
    { field: "pool", kind: "choices", options: ["default", "gpu"] },
    {
      field: "memory",
      kind: "number",
      min: 0,
      max: 1_048_576,
      units: {
        base: "MiB",
        display: [
          { symbol: "MiB", factor: 1 },
          { symbol: "GiB", factor: 1024 },
        ],
      },
    },
    { field: "owner", kind: "presence" },
    { field: "name", kind: "text" },
    { field: "seen", kind: "date" },
  ],
});

const hosts: readonly Host[] = [
  {
    id: "h1",
    name: "web-1",
    status: "deployed",
    pool: "gpu",
    memory: 65_536,
    owner: "ana",
    seen: "2026-01-02",
  },
  {
    id: "h2",
    name: "web-2",
    status: "ready",
    pool: "default",
    memory: 8192,
    seen: "2026-02-02",
  },
  {
    id: "h3",
    name: "db-1",
    status: "broken",
    pool: "gpu",
    memory: 16_384,
    owner: "ben",
    seen: "2026-03-02",
  },
];

/** The bar over the hosts, with a place outside it for focus to go. */
const mount = ({
  query,
  location,
}: {
  readonly query?: string;
  readonly location?: QueryLocation;
} = {}) => {
  const provider = createDataViewsProvider({
    collection,
    source: createArraySource<Host>({
      rows: hosts,
      collection,
      searchFields: ["name"],
    }),
    facets: ["status"],
    ...(location === undefined ? {} : { location }),
    ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
  });
  const view = render(
    <DataViews provider={provider}>
      <QueryBar data-testid="bar" />
      <button type="button">Elsewhere</button>
    </DataViews>,
  );
  return { provider, view };
};

const findEntry = () =>
  screen.getByRole<HTMLInputElement>("combobox", { name: "Filter records" });
const findPart = (name: string) =>
  screen.getByRole<HTMLInputElement>("combobox", { name });
const queryPart = (name: string) => screen.queryByRole("combobox", { name });
const findChip = (name: string | RegExp) =>
  screen.queryByRole("group", { name });
const findOption = (name: string | RegExp) =>
  screen.getByRole("option", { hidden: true, name });
const readFilter = (provider: ReturnType<typeof mount>["provider"]) =>
  provider.state.get().slice.filter;
const readStatus = () =>
  document.querySelector(".ds.data-views-announcer")?.textContent ?? "";

/** Type into an input and press keys on it, as a reader does. */
const type = (input: HTMLInputElement, value: string) =>
  fireEvent.change(input, { target: { value } });
const press = (element: Element, key: string, init: object = {}) =>
  fireEvent.keyDown(element, { key, ...init });

/** Start a clause on a field from the free-text entry. */
const startOn = async (typed: string, field = typed) => {
  act(() => findEntry().focus());
  type(findEntry(), typed);
  press(findEntry(), "Enter");
  const operator = await screen.findByRole("combobox", {
    name: `Operator for ${field}`,
  });
  return operator as HTMLInputElement;
};

describe("QueryBar", () => {
  describe("the field and its props", () => {
    it("names the field from its messages, and takes the root's props", () => {
      mount();
      expect(findEntry()).toHaveAttribute("placeholder", "Search or filter");
      expect(screen.getByRole("toolbar")).toHaveAccessibleDescription(
        "Left and Right to move between filters, Enter to edit, Backspace or Delete to remove",
      );
      expect(screen.getByTestId("bar")).toHaveClass(
        "ds",
        "data-views-query-bar",
      );
    });

    it("throws on a quick filter the schema lacks", () => {
      const provider = createDataViewsProvider({
        collection,
        source: createArraySource<Host>({ rows: hosts, collection }),
      });
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() =>
        render(
          <DataViews provider={provider}>
            <QueryBar quickFilters={["status", "flavour"]} />
          </DataViews>,
        ),
      ).toThrow('the schema has no field "flavour" to show as a quick filter');
      vi.restoreAllMocks();
      render(
        <DataViews provider={provider}>
          <QueryBar quickFilters={["status"]} label="Filter hosts" />
        </DataViews>,
      );
      expect(
        screen.getByRole("combobox", { name: "Filter hosts" }),
      ).toBeInTheDocument();
    });
  });

  describe("building clauses", () => {
    it("builds a chip by keys: field, operator, values, then Enter again", async () => {
      const { provider } = mount();
      const operator = await startOn("status");
      await waitFor(() => expect(operator).toHaveFocus());
      expect(findChip("status")).toBeInTheDocument();
      // Enter with nothing typed takes the first operator.
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      await waitFor(() => expect(value).toHaveFocus());
      type(value as HTMLInputElement, "dep");
      press(value, "Enter");
      // The value joins the chip, and the Entry stays to take another.
      expect(findChip("status is deployed")).toBeInTheDocument();
      type(findPart("Value for status"), "rea");
      press(findPart("Value for status"), "Enter");
      press(findPart("Value for status"), "Enter");
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed", "ready"] },
      ]);
      expect(findChip("status is any of deployed, ready")).toBeInTheDocument();
      await waitFor(() =>
        expect(readStatus()).toContain(
          "Added status is any of deployed, ready. 2 records.",
        ),
      );
    });

    it("builds a chip by pointer, committing it when focus leaves", async () => {
      const { provider } = mount();
      act(() => findEntry().focus());
      fireEvent.click(findOption("status"));
      const operator = await screen.findByRole("combobox", {
        name: "Operator for status",
      });
      act(() => operator.focus());
      fireEvent.click(findOption(/^is none of/));
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      act(() => value.focus());
      fireEvent.click(findOption(/^broken/));
      fireEvent.blur(findPart("Value for status"), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isNone", operands: ["broken"] },
      ]);
    });

    it("reads a typed symbol as the operator, widened and said, then the value in units", async () => {
      const { provider } = mount();
      const operator = await startOn("memory");
      type(operator, ">");
      // `>` may still become `>=`.
      expect(findPart("Operator for memory")).toHaveValue(">");
      type(findPart("Operator for memory"), ">6");
      const value = await screen.findByRole("combobox", {
        name: "Value for memory",
      });
      expect(value).toHaveValue("6");
      expect(value).toHaveAccessibleDescription("Number, in MiB or GiB");
      await waitFor(() => expect(readStatus()).toContain("Read as at least"));
      type(value as HTMLInputElement, "64 GiB");
      press(value, "Enter");
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [65_536] },
      ]);
      expect(findChip(/^memory at least 64.GiB$/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "at least" }),
      ).toHaveTextContent("≥");
    });

    it("says a typed `<` reads as at most", async () => {
      mount();
      const operator = await startOn("memory");
      type(operator, "<8");
      await waitFor(() => expect(readStatus()).toContain("Read as at most"));
    });

    it("reads a decimal with the messages' separator", async () => {
      const provider = createDataViewsProvider({
        collection,
        source: createArraySource<Host>({ rows: hosts, collection }),
      });
      render(
        <DataViews provider={provider} messages={{ decimalSeparator: "," }}>
          <QueryBar />
        </DataViews>,
      );
      const operator = await startOn("memory");
      type(operator, ">=1,5 GiB");
      press(
        await screen.findByRole("combobox", { name: "Value for memory" }),
        "Enter",
      );
      expect(provider.state.get().slice.filter).toEqual([
        { field: "memory", operator: "gte", operands: [1536] },
      ]);
      expect(
        screen.getByRole("button", { name: /^1,5.GiB$/ }),
      ).toBeInTheDocument();
    });

    it("keeps a space in a typed value, and commits a choice on Space", async () => {
      const { provider } = mount();
      const operator = await startOn("name");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for name",
      });
      expect(press(value, " ")).toBe(true);
      type(value as HTMLInputElement, "web 1");
      press(value, "Enter");
      expect(readFilter(provider)).toEqual([
        { field: "name", operator: "is", operands: ["web 1"] },
      ]);
      const pool = await startOn("pool");
      press(pool, "Enter");
      const poolValue = await screen.findByRole("combobox", {
        name: "Value for pool",
      });
      act(() => poolValue.focus());
      // Space with nothing highlighted is text.
      expect(press(poolValue, " ")).toBe(true);
      press(poolValue, "ArrowDown");
      expect(press(poolValue, " ")).toBe(false);
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(readFilter(provider)).toContainEqual({
        field: "pool",
        operator: "isAny",
        operands: ["default"],
      });
    });

    it("offers presence's two operators, and commits it with no value", async () => {
      const { provider } = mount();
      const operator = await startOn("owner");
      act(() => operator.focus());
      fireEvent.click(findOption(/^has no value/));
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(readFilter(provider)).toEqual([
        { field: "owner", operator: "isSet", operands: [false] },
      ]);
      expect(findChip("owner has no value")).toBeInTheDocument();
    });

    it("shapes a date's Entry with its template", async () => {
      const { provider } = mount();
      const operator = await startOn("seen");
      type(operator, "<=");
      const value = await screen.findByRole("combobox", {
        name: "Value for seen",
      });
      expect(value).toHaveAccessibleDescription(/Date, format YYYY-MM-DD/);
      type(value as HTMLInputElement, "2026-02-28");
      press(value, "Enter");
      expect(readFilter(provider)).toEqual([
        { field: "seen", operator: "lte", operands: ["2026-02-28"] },
      ]);
    });

    it("writes a part typed exactly on Tab, and drops a draft incomplete past its end", async () => {
      const { provider } = mount();
      const operator = await startOn("status");
      type(operator, "is any of");
      press(operator, "Tab");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      type(value as HTMLInputElement, "ready");
      press(value, "Tab");
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
      const pool = await startOn("pool");
      type(pool, ":");
      const poolValue = await screen.findByRole("combobox", {
        name: "Value for pool",
      });
      press(poolValue, "Tab");
      await waitFor(() => expect(findChip("pool")).toBeNull());
    });

    it("takes a draft's first operator on Tab, and keeps one whose typed operator offers none", async () => {
      const { provider } = mount();
      const operator = await startOn("status");
      press(operator, "Tab");
      expect(
        await screen.findByRole("combobox", { name: "Value for status" }),
      ).toBeInTheDocument();
      expect(findChip("status is any of")).toBeInTheDocument();
      press(findPart("Value for status"), "Escape");
      if (queryPart("Value for status") !== null) {
        press(findPart("Value for status"), "Escape");
      }
      // Typed text that narrows to nothing keeps the Entry, marked and said.
      const again = await startOn("status");
      type(again, "zzz");
      press(again, "Tab");
      expect(findPart("Operator for status")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await waitFor(() =>
        expect(readStatus()).toContain("Invalid: No matches"),
      );
      expect(readFilter(provider)).toEqual([]);
    });

    it("returns a draft's field to the entry as text on Shift+Tab from its operator", async () => {
      mount();
      const operator = await startOn("status");
      press(operator, "Tab", { shiftKey: true });
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(findEntry()).toHaveValue("status");
      expect(findChip("status")).toBeNull();
    });

    it("drops the draft with its remove control or Delete", async () => {
      mount();
      await startOn("status");
      fireEvent.click(screen.getByRole("button", { name: "Remove status" }));
      await waitFor(() => expect(findChip("status")).toBeNull());
      await startOn("status");
      press(screen.getByRole("button", { name: "status" }), "Delete");
      await waitFor(() => expect(findChip("status")).toBeNull());
    });

    it("settles an operator typed as a symbol that a longer one could continue, and its shown form", async () => {
      const { provider } = mount();
      const operator = await startOn("memory");
      type(operator, ">");
      press(findPart("Operator for memory"), "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for memory",
      });
      await waitFor(() => expect(readStatus()).toContain("Read as at least"));
      type(value as HTMLInputElement, "8 GiB");
      press(value, "Enter");
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [8192] },
      ]);
      // The symbol the chip shows types as it is.
      const again = await startOn("memory");
      type(again, "≤");
      expect(
        await screen.findByRole("combobox", { name: "Value for memory" }),
      ).toBeInTheDocument();
      // Options narrow by their symbols too.
      press(findPart("Value for memory"), "Escape");
      if (queryPart("Value for memory") !== null) {
        press(findPart("Value for memory"), "Escape");
      }
      const third = await startOn("status");
      type(third, "!");
      expect(
        screen.getByRole("option", { hidden: true, name: /^is none of/ }),
      ).toBeInTheDocument();
      type(third, "!=");
      expect(
        await screen.findByRole("combobox", { name: "Value for status" }),
      ).toBeInTheDocument();
    });

    it("takes the operator its words narrow to on Enter, and a `<` as at most", async () => {
      const { provider } = mount();
      const operator = await startOn("status");
      type(operator, "none");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      expect(findChip("status is none of")).toBeInTheDocument();
      press(value, "Escape");
      if (queryPart("Value for status") !== null) {
        press(findPart("Value for status"), "Escape");
      }
      const memory = await startOn("memory");
      type(memory, "<");
      press(findPart("Operator for memory"), "Tab");
      await waitFor(() => expect(readStatus()).toContain("Read as at most"));
      type(findPart("Value for memory"), "4096");
      press(findPart("Value for memory"), "Enter");
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "lte", operands: [4096] },
      ]);
    });
  });

  describe("editing clauses", () => {
    it("edits a value by pointer: the Entry takes the Segment's place, and a pick replaces it", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      expect(screen.queryByRole("button", { name: "deployed" })).toBeNull();
      act(() => value.focus());
      fireEvent.click(findOption(/^ready/));
      press(findPart("Value for status"), "Enter");
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "ready" })).toHaveFocus(),
      );
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
      await waitFor(() =>
        expect(readStatus()).toContain("Changed to status is ready."),
      );
      // Escape gives the held values back; so does Enter with none picked.
      fireEvent.click(screen.getByRole("button", { name: "ready" }));
      press(findPart("Value for status"), "Escape");
      if (queryPart("Value for status") !== null) {
        press(findPart("Value for status"), "Escape");
      }
      expect(findChip("status is ready")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "ready" }));
      press(findPart("Value for status"), "Enter");
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
    });

    it("edits a chip's operator into another address, the chip keeping the stop", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "is" }));
      const operator = await screen.findByRole("combobox", {
        name: "Operator for status",
      });
      act(() => operator.focus());
      fireEvent.click(findOption(/^is none of/));
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isNone", operands: ["deployed"] },
      ]);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "is none of" }),
        ).toHaveFocus(),
      );
    });

    it("edits a typed value from its current text", async () => {
      const { provider } = mount({ query: "memory__gte=65536" });
      fireEvent.click(await screen.findByRole("button", { name: /^64.GiB$/ }));
      const value = await screen.findByRole("combobox", {
        name: "Value for memory",
      });
      expect(value).toHaveValue("64 GiB");
      type(value as HTMLInputElement, "32 GiB");
      press(value, "Enter");
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [32_768] },
      ]);
    });

    it("walks the parts with Tab and Shift+Tab, and commits past the last", async () => {
      // jsdom lays nothing out: every element counts as laid out here.
      vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
        {},
      ] as unknown as DOMRectList);
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "status" }));
      const field = await screen.findByRole("combobox", { name: "Field" });
      expect(press(field, "Tab")).toBe(false);
      const operator = await screen.findByRole("combobox", {
        name: "Operator for status",
      });
      press(operator, "Tab");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      press(value, "Tab", { shiftKey: true });
      await screen.findByRole("combobox", { name: "Operator for status" });
      press(findPart("Operator for status"), "Tab");
      act(() => findPart("Value for status").focus());
      press(findPart("Value for status"), "ArrowDown");
      press(findPart("Value for status"), "ArrowDown");
      press(findPart("Value for status"), "Tab");
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      // The pick replaced the held value, and focus left the chip forward.
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Clear filters and search" }),
        ).toHaveFocus(),
      );
      // Shift+Tab before the first part commits, and focus leaves backward.
      fireEvent.click(screen.getByRole("button", { name: "status" }));
      press(findPart("Field"), "Tab", { shiftKey: true });
      await waitFor(() => expect(queryPart("Field")).toBeNull());
      // Nothing is before the bar: focus leaves for the page.
      await waitFor(() => expect(document.body).toHaveFocus());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
      vi.restoreAllMocks();
    });

    it("keeps an invalid typed value out on Tab, and cancels on blur", async () => {
      const { provider } = mount({ query: "memory__gte=65536" });
      fireEvent.click(await screen.findByRole("button", { name: /^64.GiB$/ }));
      type(findPart("Value for memory"), "lots");
      press(findPart("Value for memory"), "Tab", { shiftKey: true });
      const operator = await screen.findByRole("combobox", {
        name: "Operator for memory",
      });
      fireEvent.blur(operator, {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [65_536] },
      ]);
      fireEvent.click(screen.getByRole("button", { name: /^64.GiB$/ }));
      type(findPart("Value for memory"), "lots");
      fireEvent.blur(findPart("Value for memory"), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(queryPart("Value for memory")).toBeNull();
    });

    it("layers Escape: a draft dropped, an edit restored with focus on its part", async () => {
      mount({ query: "status=deployed" });
      const operator = await startOn("pool");
      // The first Escape closes the suggestions; the draft stays.
      press(operator, "Escape");
      expect(findChip("pool")).toBeInTheDocument();
      press(findPart("Operator for pool"), "Escape");
      await waitFor(() => expect(findChip("pool")).toBeNull());
      fireEvent.click(screen.getByRole("button", { name: "status" }));
      const field = await screen.findByRole("combobox", { name: "Field" });
      act(() => field.focus());
      fireEvent.click(findOption(/^pool/));
      // The clause keeps its operator, which pool is offered too.
      await screen.findByRole("combobox", { name: "Value for pool" });
      press(findPart("Value for pool"), "Escape");
      if (queryPart("Value for pool") !== null) {
        press(findPart("Value for pool"), "Escape");
      }
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "status" })).toHaveFocus(),
      );
      expect(findChip("status is deployed")).toBeInTheDocument();
    });

    it("keeps a field's Segment when Enter finds nothing to choose, and commits an edit unchanged", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "status" }));
      const field = await screen.findByRole("combobox", { name: "Field" });
      type(field as HTMLInputElement, "zzz");
      press(field, "Enter");
      expect(findPart("Field")).toBeInTheDocument();
      type(findPart("Field"), "");
      press(findPart("Field"), "Enter");
      await waitFor(() => expect(queryPart("Field")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed"] },
      ]);
      // A Segment pressed in the chip whose Entry is open moves the Entry.
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      fireEvent.click(screen.getByRole("button", { name: "status" }));
      expect(findPart("Field")).toBeInTheDocument();
      // A draft's field takes no Entry while it is its only Segment.
      await startOn("pool");
      fireEvent.click(screen.getByRole("button", { name: "pool" }));
      expect(findPart("Operator for pool")).toBeInTheDocument();
      // Enter on an empty value of a choice with nothing chosen waits.
      press(findPart("Operator for pool"), "Enter");
      press(
        await screen.findByRole("combobox", { name: "Value for pool" }),
        "Enter",
      );
      expect(findPart("Value for pool")).toBeInTheDocument();
    });

    it("commits a typed value left as it was, and an operator typed over a held value", async () => {
      const { provider } = mount({ query: "memory__gte=65536&pool=gpu" });
      fireEvent.click(await screen.findByRole("button", { name: /^64.GiB$/ }));
      type(findPart("Value for memory"), " ");
      press(findPart("Value for memory"), "Enter");
      await waitFor(() => expect(queryPart("Value for memory")).toBeNull());
      // A symbol typed over a held value opens the value empty, and Enter
      // with nothing typed keeps the held value.
      fireEvent.click(screen.getByRole("button", { name: "at least" }));
      type(findPart("Operator for memory"), "<=");
      expect(findPart("Value for memory")).toHaveValue("");
      press(findPart("Value for memory"), "Enter");
      await waitFor(() => expect(queryPart("Value for memory")).toBeNull());
      expect(readFilter(provider)).toContainEqual({
        field: "memory",
        operator: "lte",
        operands: [65_536],
      });
      // An operator typed with a value after it moves on to that value.
      fireEvent.click(screen.getByRole("button", { name: "at most" }));
      type(findPart("Operator for memory"), ">=32");
      expect(findPart("Value for memory")).toHaveValue("32");
      fireEvent.blur(findPart("Value for memory"), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      // Enter with nothing typed keeps the operator an edit holds.
      fireEvent.click(screen.getByRole("button", { name: "is" }));
      press(findPart("Operator for pool"), "Enter");
      await waitFor(() => expect(queryPart("Operator for pool")).toBeNull());
      expect(readFilter(provider)).toContainEqual({
        field: "pool",
        operator: "isAny",
        operands: ["gpu"],
      });
    });

    it("reads an edited number back exactly, and writes and says nothing for an unchanged edit", async () => {
      const { provider } = mount({ query: "memory__gte=1500" });
      fireEvent.click(
        await screen.findByRole("button", { name: /^1\.46484375.GiB$/ }),
      );
      expect(findPart("Value for memory")).toHaveValue("1.46484375\u00a0GiB");
      const setPredicate = vi.spyOn(readProviderHost(provider), "setPredicate");
      press(findPart("Value for memory"), "Enter");
      await waitFor(() => expect(queryPart("Value for memory")).toBeNull());
      expect(setPredicate).not.toHaveBeenCalled();
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [1500] },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(readStatus()).not.toContain("Changed");
      vi.restoreAllMocks();
    });

    it("keeps an edit's operator when what is typed narrows to the one it holds", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "is" }));
      type(findPart("Operator for status"), "is");
      press(findPart("Operator for status"), "Enter");
      // The Entry moves on to the value, the operator kept.
      expect(
        await screen.findByRole("combobox", { name: "Value for status" }),
      ).toBeInTheDocument();
      press(findPart("Value for status"), "Enter");
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed"] },
      ]);
      // At the last part, the held value typed keeps the clause as it is.
      fireEvent.click(screen.getByRole("button", { name: "status" }));
      type(findPart("Field"), "status");
      press(findPart("Field"), "Enter");
      expect(
        await screen.findByRole("combobox", { name: "Operator for status" }),
      ).toBeInTheDocument();
    });

    it("reads what is typed in before a Segment press moves the Entry", async () => {
      const { provider } = mount({ query: "memory__gte=65536" });
      fireEvent.click(await screen.findByRole("button", { name: /^64.GiB$/ }));
      // Text that does not read stays out as the Entry moves.
      type(findPart("Value for memory"), "lots");
      fireEvent.click(screen.getByRole("button", { name: "at least" }));
      await screen.findByRole("combobox", { name: "Operator for memory" });
      fireEvent.click(screen.getByRole("button", { name: /^64.GiB$/ }));
      type(findPart("Value for memory"), "32 GiB");
      fireEvent.click(screen.getByRole("button", { name: "at least" }));
      const operator = await screen.findByRole("combobox", {
        name: "Operator for memory",
      });
      act(() => operator.focus());
      fireEvent.click(findOption(/^at most/));
      await waitFor(() => expect(queryPart("Operator for memory")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "lte", operands: [32_768] },
      ]);
    });

    it("keeps the values picked in an edit when the Entry walks back to them", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      act(() => findPart("Value for status").focus());
      fireEvent.click(findOption(/^ready/));
      press(findPart("Value for status"), "Tab", { shiftKey: true });
      await screen.findByRole("combobox", { name: "Operator for status" });
      press(findPart("Operator for status"), "Tab");
      await screen.findByRole("combobox", { name: "Value for status" });
      expect(screen.getByRole("button", { name: "ready" })).toBeInTheDocument();
      press(findPart("Value for status"), "Enter");
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
    });

    it("cancels an edit Tab cannot complete, and still leaves the bar that way", async () => {
      vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
        {},
      ] as unknown as DOMRectList);
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "status" }));
      act(() => findPart("Field").focus());
      fireEvent.click(findOption(/^pool/));
      const value = await screen.findByRole("combobox", {
        name: "Value for pool",
      });
      press(value, "Tab");
      await waitFor(() => expect(queryPart("Value for pool")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed"] },
      ]);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Clear filters and search" }),
        ).toHaveFocus(),
      );
      // Left by blur instead, it is cancelled the same way.
      fireEvent.click(screen.getByRole("button", { name: "status" }));
      act(() => findPart("Field").focus());
      fireEvent.click(findOption(/^pool/));
      fireEvent.blur(
        await screen.findByRole("combobox", { name: "Value for pool" }),
        {
          relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
        },
      );
      await waitFor(() => expect(queryPart("Value for pool")).toBeNull());
      expect(findChip("status is deployed")).toBeInTheDocument();
      vi.restoreAllMocks();
    });

    it("opens the value empty after an operator typed key by key over a held value", async () => {
      const { provider } = mount({ query: "memory__gte=65536" });
      fireEvent.click(await screen.findByRole("button", { name: "at least" }));
      type(findPart("Operator for memory"), "<");
      type(findPart("Operator for memory"), "<=");
      const value = await screen.findByRole("combobox", {
        name: "Value for memory",
      });
      expect(value).toHaveValue("");
      type(value as HTMLInputElement, "3");
      type(findPart("Value for memory"), "32 GiB");
      press(findPart("Value for memory"), "Enter");
      await waitFor(() => expect(queryPart("Value for memory")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "lte", operands: [32_768] },
      ]);
    });

    it("narrows typed text on Tab as on Enter, keeping the clause where it narrows to what it holds", async () => {
      const { provider } = mount({ query: "memory__gte=65536" });
      fireEvent.click(await screen.findByRole("button", { name: "at least" }));
      type(findPart("Operator for memory"), "most");
      press(findPart("Operator for memory"), "Tab");
      expect(
        await screen.findByRole("combobox", { name: "Value for memory" }),
      ).toBeInTheDocument();
      press(findPart("Value for memory"), "Enter");
      await waitFor(() => expect(queryPart("Value for memory")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "lte", operands: [65_536] },
      ]);
      // The field part narrows too; the held field keeps the clause.
      fireEvent.click(screen.getByRole("button", { name: "memory" }));
      type(findPart("Field"), "mem");
      press(findPart("Field"), "Tab");
      expect(
        await screen.findByRole("combobox", { name: "Operator for memory" }),
      ).toBeInTheDocument();
      press(findPart("Operator for memory"), "Escape");
      if (queryPart("Operator for memory") !== null) {
        press(findPart("Operator for memory"), "Escape");
      }
      // A draft's choice value narrows to its first option and applies.
      const status = await startOn("status");
      press(status, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      type(value as HTMLInputElement, "rea");
      press(value, "Tab");
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toContainEqual({
        field: "status",
        operator: "isAny",
        operands: ["ready"],
      });
    });
  });

  describe("invalid input and refusals", () => {
    it("marks a typed value that does not read, and keeps the Entry", async () => {
      const { provider } = mount();
      const operator = await startOn("memory");
      type(operator, ">=");
      const value = await screen.findByRole("combobox", {
        name: "Value for memory",
      });
      type(value as HTMLInputElement, "16 GX");
      press(value, "Enter");
      expect(findPart("Value for memory")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(findPart("Value for memory")).toHaveAccessibleDescription(
        /Invalid: "GX" is not a unit; use MiB or GiB/,
      );
      type(findPart("Value for memory"), "16 G");
      expect(findPart("Value for memory")).not.toHaveAttribute("aria-invalid");
      press(findPart("Value for memory"), "Enter");
      expect(findPart("Value for memory")).toHaveAccessibleDescription(
        /Enter a value to apply this restriction/,
      );
      // Over the field's maximum, the schema refuses it.
      type(findPart("Value for memory"), "2048 GiB");
      press(findPart("Value for memory"), "Enter");
      expect(findPart("Value for memory")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(readFilter(provider)).toEqual([]);
    });

    it("says why a clause the source refuses did not apply, and keeps its Entry", async () => {
      const provider = createDataViewsProvider({
        collection,
        source: createArraySource<Host>({ rows: hosts, collection }),
      });
      render(
        <DataViews provider={provider}>
          <QueryBar />
          <button type="button">Elsewhere</button>
        </DataViews>,
      );
      const operator = await startOn("status");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      vi.spyOn(readProviderHost(provider), "addPredicate").mockReturnValue([
        {
          part: "filter",
          code: "undeclared-operator",
          field: "status",
          operator: "isAny",
          reason: "not now",
        },
      ]);
      type(value as HTMLInputElement, "ready");
      press(value, "Enter");
      press(findPart("Value for status"), "Enter");
      expect(findPart("Value for status")).toHaveAccessibleDescription(
        /Invalid: not now/,
      );
      fireEvent.blur(findPart("Value for status"), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(queryPart("Value for status")).toBeNull();
      vi.restoreAllMocks();
    });

    it("leaves the query as it stands when a removal or search is refused", async () => {
      const { provider } = mount({ query: "status=deployed" });
      await screen.findByRole("button", { name: "deployed" });
      vi.spyOn(readProviderHost(provider), "removePredicate").mockReturnValue([
        {
          part: "filter",
          code: "undeclared-operator",
          field: "status",
          operator: "isAny",
          reason: "no",
        },
      ]);
      vi.spyOn(provider, "setSearch").mockReturnValue([
        {
          part: "search",
          code: "undeclared-field",
          field: null,
          operator: null,
          reason: "no",
        },
      ]);
      fireEvent.click(
        screen.getByRole("button", { name: "Remove status is deployed" }),
      );
      expect(findChip("status is deployed")).toBeInTheDocument();
      await waitFor(() =>
        expect(readStatus()).toContain(
          "No. The previous restriction still applies.",
        ),
      );
      type(findEntry(), "web");
      press(findEntry(), "Enter");
      expect(findEntry()).toHaveValue("web");
      vi.restoreAllMocks();
    });

    it("says why a clause committed on blur was refused", async () => {
      const { provider } = mount();
      const operator = await startOn("status");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      vi.spyOn(readProviderHost(provider), "addPredicate").mockReturnValue([
        {
          part: "filter",
          code: "undeclared-operator",
          field: "status",
          operator: "isAny",
          reason: "Not now",
        },
      ]);
      act(() => value.focus());
      fireEvent.click(findOption(/^ready/));
      fireEvent.blur(findPart("Value for status"), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(queryPart("Value for status")).toBeNull();
      await waitFor(() => expect(readStatus()).toContain("Not now."));
      vi.restoreAllMocks();
    });

    it("says why a value does not read on Enter, and on Tab past the end keeps it marked", async () => {
      mount();
      const operator = await startOn("memory");
      type(operator, ">=");
      const value = await screen.findByRole("combobox", {
        name: "Value for memory",
      });
      type(value as HTMLInputElement, "lots");
      press(value, "Enter");
      await waitFor(() =>
        expect(readStatus()).toContain("Invalid: not a number"),
      );
      type(findPart("Value for memory"), "16 GX");
      press(findPart("Value for memory"), "Tab");
      // Nothing is thrown away: the Entry stays, marked and said.
      expect(findPart("Value for memory")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(findPart("Value for memory")).toHaveValue("16 GX");
      await waitFor(() =>
        expect(readStatus()).toContain('Invalid: "GX" is not a unit'),
      );
    });
  });

  describe("the search", () => {
    it("searches what is typed when it names no field, and edits and removes the search", async () => {
      const { provider } = mount();
      act(() => findEntry().focus());
      type(findEntry(), "web");
      press(findEntry(), "Enter");
      expect(provider.state.get().slice.search).toBe("web");
      expect(findEntry()).toHaveValue("");
      expect(findChip("Search for web")).toBeInTheDocument();
      await waitFor(() =>
        expect(readStatus()).toContain("Added Search for web."),
      );
      // A second search replaces the first.
      type(findEntry(), "db");
      press(findEntry(), "Enter");
      expect(provider.state.get().slice.search).toBe("db");
      await waitFor(() =>
        expect(readStatus()).toContain("Changed to Search for db."),
      );
      // The search is edited where it is typed.
      fireEvent.click(screen.getByRole("button", { name: "db" }));
      expect(findEntry()).toHaveValue("db");
      await waitFor(() => expect(findEntry()).toHaveFocus());
      type(findEntry(), "");
      // An empty entry searches nothing.
      press(findEntry(), "Enter");
      expect(findChip("Search for")).toBeNull();
    });

    it("leaves Enter alone where something else handled it", () => {
      const { provider } = mount();
      type(findEntry(), "web");
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      event.preventDefault();
      findEntry().dispatchEvent(event);
      expect(provider.state.get().slice.search).toBeNull();
    });

    it("searches what is only the start of a field's name", async () => {
      const { provider } = mount();
      act(() => findEntry().focus());
      type(findEntry(), "sta");
      press(findEntry(), "Enter");
      expect(provider.state.get().slice.search).toBe("sta");
      expect(findChip("status")).toBeNull();
      // A field's name typed whole, case aside, starts its clause.
      type(findEntry(), "STATUS");
      press(findEntry(), "Enter");
      expect(
        await screen.findByRole("combobox", { name: "Operator for status" }),
      ).toBeInTheDocument();
    });

    it("says nothing for a search that already applies", async () => {
      const { provider } = mount({ query: "q=web" });
      await screen.findByRole("button", { name: "web" });
      const setSearch = vi.spyOn(provider, "setSearch");
      type(findEntry(), "web");
      press(findEntry(), "Enter");
      expect(setSearch).not.toHaveBeenCalled();
      expect(findEntry()).toHaveValue("");
      vi.restoreAllMocks();
    });
  });

  describe("removing and clearing", () => {
    it("selects the last chip with Backspace on the empty entry, and removes it", async () => {
      // The chips stand in canonical order: pool, then status.
      const { provider } = mount({ query: "status=deployed&pool=gpu" });
      await screen.findByRole("button", { name: "status" });
      act(() => findEntry().focus());
      expect(press(findEntry(), "Backspace")).toBe(false);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "status" })).toHaveFocus(),
      );
      press(screen.getByRole("button", { name: "status" }), "Backspace");
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "pool" })).toHaveFocus(),
      );
      press(screen.getByRole("button", { name: "gpu" }), "Delete");
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(readFilter(provider)).toEqual([]);
      await waitFor(() =>
        expect(readStatus()).toContain("Removed pool is gpu."),
      );
    });

    it("removes a chip with its remove control, the stop moving to the next", async () => {
      const { provider } = mount({ query: "status=deployed&pool=gpu&q=web" });
      fireEvent.click(
        await screen.findByRole("button", { name: "Remove pool is gpu" }),
      );
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed"] },
      ]);
      // The next chip takes the stop.
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "status" })).toHaveAttribute(
          "tabindex",
          "0",
        ),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Remove Search for web" }),
      );
      expect(provider.state.get().slice.search).toBeNull();
      // Backspace on the search chip removes it too.
      type(findEntry(), "db");
      press(findEntry(), "Enter");
      press(await screen.findByRole("button", { name: "db" }), "Backspace");
      expect(provider.state.get().slice.search).toBeNull();
    });

    it("moves the stop by the place a chip holds once an open draft is applied", async () => {
      const { provider } = mount({ query: "status=deployed&pool=gpu&q=web" });
      const operator = await startOn("memory");
      type(operator, ">=");
      type(findPart("Value for memory"), "64 GiB");
      fireEvent.click(
        screen.getByRole("button", { name: "Remove status is deployed" }),
      );
      expect(readFilter(provider)).toEqual([
        { field: "pool", operator: "isAny", operands: ["gpu"] },
        { field: "memory", operator: "gte", operands: [65_536] },
      ]);
      // memory sorts ahead of status: the chip after status is the search.
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "web" })).toHaveAttribute(
          "tabindex",
          "0",
        ),
      );
      expect(screen.getByRole("button", { name: "pool" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
    });

    it("clears the filters and the search, focuses the entry, and hides the control", async () => {
      const { provider } = mount({ query: "status=deployed&q=web" });
      type(findEntry(), "x");
      fireEvent.click(
        await screen.findByRole("button", { name: "Clear filters and search" }),
      );
      expect(provider.state.get().slice).toMatchObject({
        filter: [],
        search: null,
      });
      expect(findEntry()).toHaveFocus();
      expect(findEntry()).toHaveValue("");
      expect(
        screen.queryByRole("button", { name: "Clear filters and search" }),
      ).toBeNull();
    });

    it("says what clearing did, with the count", async () => {
      mount({ query: "status=deployed" });
      fireEvent.click(
        await screen.findByRole("button", { name: "Clear filters and search" }),
      );
      await waitFor(() =>
        expect(readStatus()).toContain(
          "Cleared the filters and the search. 3 records.",
        ),
      );
    });

    it("says why a clear is refused, keeping the text and the session", async () => {
      const { provider } = mount({ query: "status=deployed" });
      const clear = await screen.findByRole("button", {
        name: "Clear filters and search",
      });
      vi.spyOn(provider, "clear").mockReturnValue([
        {
          part: "filter",
          code: "undeclared-field",
          field: null,
          operator: null,
          reason: "no",
        },
      ]);
      type(findEntry(), "web");
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      await screen.findByRole("combobox", { name: "Value for status" });
      fireEvent.click(clear);
      await waitFor(() =>
        expect(readStatus()).toContain(
          "No. The previous restriction still applies.",
        ),
      );
      expect(readStatus()).not.toContain("Cleared");
      expect(findEntry()).toHaveValue("web");
      // The open edit stands.
      expect(findPart("Value for status")).toBeInTheDocument();
      vi.restoreAllMocks();
    });
  });

  describe("keys and focus", () => {
    it("commits the highlighted option when focus leaves", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "is" }));
      const operator = await screen.findByRole("combobox", {
        name: "Operator for status",
      });
      act(() => operator.focus());
      press(operator, "ArrowDown");
      press(operator, "ArrowDown");
      fireEvent.blur(operator, {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isNone", operands: ["deployed"] },
      ]);
    });

    it("leaves a key another handler took", async () => {
      mount();
      const operator = await startOn("status");
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      });
      event.preventDefault();
      operator.dispatchEvent(event);
      expect(findChip("status")).toBeInTheDocument();
    });

    it("returns to the entry from a chip on Escape or a typed character", async () => {
      mount({ query: "status=deployed" });
      const field = await screen.findByRole("button", { name: "status" });
      act(() => field.focus());
      expect(press(field, "Escape")).toBe(false);
      await waitFor(() => expect(findEntry()).toHaveFocus());
      act(() => field.focus());
      expect(press(field, " ")).toBe(true);
      expect(press(field, "c", { ctrlKey: true })).toBe(true);
      expect(press(field, "p")).toBe(false);
      await waitFor(() => expect(findEntry()).toHaveFocus());
      expect(findEntry()).toHaveValue("p");
    });

    it("moves the stop with the arrows, but not while the caret has text to cross", async () => {
      mount({ query: "status=deployed" });
      const first = await screen.findByRole("button", { name: "status" });
      type(findEntry(), "ab");
      findEntry().setSelectionRange(1, 1);
      expect(press(findEntry(), "ArrowLeft")).toBe(true);
      expect(press(findEntry(), "ArrowRight")).toBe(true);
      findEntry().setSelectionRange(0, 0);
      expect(press(findEntry(), "ArrowLeft")).toBe(false);
      expect(first).toHaveAttribute("tabindex", "0");
      expect(press(first, "ArrowLeft")).toBe(true);
      expect(press(first, "ArrowRight")).toBe(false);
      expect(findEntry()).toHaveAttribute("tabindex", "0");
      expect(press(first, "Home")).toBe(true);
      const clear = screen.getByRole("button", {
        name: "Clear filters and search",
      });
      expect(press(clear, "ArrowLeft")).toBe(true);
    });

    it("leaves the arrows to the caret in an open Entry", async () => {
      mount();
      const operator = await startOn("status");
      expect(press(operator, "ArrowLeft")).toBe(true);
      expect(findChip("status")).toBeInTheDocument();
    });

    it("ends an open edit as a stop move does when another chip's remove control is pressed", async () => {
      const { provider } = mount({ query: "status=deployed&pool=gpu" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      await screen.findByRole("combobox", { name: "Value for status" });
      fireEvent.click(
        screen.getByRole("button", { name: "Remove pool is gpu" }),
      );
      expect(queryPart("Value for status")).toBeNull();
      expect(readFilter(provider)).toHaveLength(1);
    });

    it("holds the stop's move during a press, so the pressed part stays put", async () => {
      const { provider } = mount({ query: "status=deployed&pool=gpu" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      act(() => value.focus());
      const remove = screen.getByRole("button", { name: "Remove pool is gpu" });
      fireEvent.pointerDown(remove);
      act(() => value.blur());
      act(() => remove.focus());
      // The edit stands while the press lasts, its chip as wide as it was.
      expect(queryPart("Value for status")).toBeInTheDocument();
      fireEvent.pointerUp(document);
      // A press that ends with no part pressed ends the edit after a task.
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toHaveLength(2);
      // A press on another chip's part opens that part, and its end leaves
      // the part open.
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      const gpu = screen.getByRole("button", { name: "gpu" });
      fireEvent.pointerDown(gpu);
      act(() => gpu.focus());
      expect(queryPart("Value for status")).toBeInTheDocument();
      fireEvent.click(gpu);
      fireEvent.pointerUp(document);
      await new Promise((resolve) => setTimeout(resolve));
      expect(queryPart("Value for status")).toBeNull();
      expect(findPart("Value for pool")).toBeInTheDocument();
    });

    it("commits once focus has gone nowhere for a task, or after a press ends", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      act(() => value.focus());
      fireEvent.pointerDown(screen.getByRole("button", { name: "status" }));
      act(() => value.blur());
      await new Promise((resolve) => setTimeout(resolve));
      expect(queryPart("Value for status")).toBeInTheDocument();
      fireEvent.pointerUp(document);
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      fireEvent.pointerDown(screen.getByRole("button", { name: "status" }));
      fireEvent.pointerCancel(document);
      await new Promise((resolve) => setTimeout(resolve));
      act(() => findPart("Value for status").focus());
      act(() => findPart("Value for status").blur());
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toHaveLength(1);
      // Focus moving within the bar commits nothing.
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      fireEvent.blur(findPart("Value for status"), {
        relatedTarget: findEntry(),
      });
      await new Promise((resolve) => setTimeout(resolve));
      // Focus coming back before the task ends keeps the edit.
      fireEvent.blur(findPart("Value for status"));
      act(() => findPart("Value for status").focus());
      await new Promise((resolve) => setTimeout(resolve));
      expect(queryPart("Value for status")).toBeInTheDocument();
    });

    it("does nothing on blur with no Entry open", () => {
      const { provider } = mount();
      act(() => findEntry().focus());
      fireEvent.blur(findEntry(), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(readFilter(provider)).toEqual([]);
    });

    it("restores an edit that cannot commit when focus leaves, and leaves focus where it went", async () => {
      const { provider } = mount({ query: "memory__gte=65536" });
      fireEvent.click(await screen.findByRole("button", { name: /^64.GiB$/ }));
      const value = findPart("Value for memory");
      act(() => value.focus());
      type(value, "lots");
      act(() => value.blur());
      await waitFor(() => expect(queryPart("Value for memory")).toBeNull());
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(document.body).toHaveFocus();
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [65_536] },
      ]);
    });

    it("applies a finished draft when the stop moves to another item in the bar", async () => {
      const { provider } = mount();
      act(() => findEntry().focus());
      fireEvent.click(findOption("status"));
      const operator = await screen.findByRole("combobox", {
        name: "Operator for status",
      });
      act(() => operator.focus());
      fireEvent.click(findOption(/^is any of/));
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      act(() => value.focus());
      fireEvent.click(findOption(/^ready/));
      // A press on the free-text entry, inside the bar.
      act(() => findEntry().focus());
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
      expect(findEntry()).toHaveFocus();
      // An incomplete draft is dropped the same way.
      const pool = await startOn("pool");
      act(() => pool.focus());
      act(() => findEntry().focus());
      await waitFor(() => expect(findChip("pool")).toBeNull());
    });

    it("gives focus taken back into the bar after a blur back to the page", async () => {
      mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      const value = findPart("Value for status");
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      act(() => {
        fireEvent.blur(value, { relatedTarget: elsewhere });
        // Something in the bar takes focus before the commit's effects run.
        findEntry().focus();
      });
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(screen.getByTestId("bar").contains(document.activeElement)).toBe(
        false,
      );
    });

    it("applies an open draft when another chip's part is pressed, then opens that part", async () => {
      const { provider } = mount({ query: "status=deployed" });
      await screen.findByRole("button", { name: "deployed" });
      const memory = await startOn("memory");
      type(memory, ">=8 GiB");
      expect(findPart("Value for memory")).toHaveValue("8 GiB");
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      expect(
        await screen.findByRole("combobox", { name: "Value for status" }),
      ).toBeInTheDocument();
      expect(readFilter(provider)).toContainEqual({
        field: "memory",
        operator: "gte",
        operands: [8192],
      });
    });

    it("leaves Enter to an input method while it composes", async () => {
      const { provider } = mount();
      type(findEntry(), "web");
      press(findEntry(), "Enter", { isComposing: true });
      expect(provider.state.get().slice.search).toBeNull();
      const operator = await startOn("status");
      press(operator, "Enter", { isComposing: true });
      expect(findPart("Operator for status")).toBeInTheDocument();
    });

    it("reads a value typed exactly when focus leaves, and ends a draft when the search chip is pressed", async () => {
      const { provider } = mount({ query: "status=deployed&q=web" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      type(findPart("Value for status"), "ready");
      fireEvent.blur(findPart("Value for status"), {
        relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
      });
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
      await startOn("pool");
      fireEvent.click(screen.getByRole("button", { name: "web" }));
      await waitFor(() => expect(findChip("pool")).toBeNull());
      expect(findEntry()).toHaveValue("web");
    });
  });

  describe("announcements and suggestions", () => {
    it("says suggestions load while a server's options have not come", async () => {
      const serverCollection = createCollection({
        identify: (host: { readonly id: string; readonly zone: string }) =>
          host.id,
        fields: [{ field: "zone", kind: "choices" }],
      });
      const source = createManualSource<{
        readonly id: string;
        readonly zone: string;
      }>({
        capabilities: declareCapabilities(serverCollection, {
          filter: { zone: ["isAny"] },
          facets: ["zone"],
        }),
      });
      const provider = createDataViewsProvider({
        collection: serverCollection,
        source: source.source,
        facets: ["zone"],
      });
      render(
        <DataViews provider={provider}>
          <QueryBar />
        </DataViews>,
      );
      const operator = await startOn("zone");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for zone",
      });
      act(() => value.focus());
      await waitFor(() =>
        expect(
          document.querySelector('.ds.query-input [role="status"]'),
        ).toHaveTextContent("Loading suggestions"),
      );
      expect(screen.queryByText("No matches")).toBeNull();
    });

    it("says nothing of no matches while a search is typed", async () => {
      mount();
      act(() => findEntry().focus());
      type(findEntry(), "node-1");
      await new Promise((resolve) => setTimeout(resolve));
      expect(
        document.querySelector('.ds.query-input [role="status"]'),
      ).toHaveTextContent("");
      expect(screen.queryByText("No matches")).toBeNull();
    });

    it("says each value picked among several, with Enter again to apply", async () => {
      mount();
      const operator = await startOn("status");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      type(value as HTMLInputElement, "dep");
      press(value, "Enter");
      await waitFor(() =>
        expect(readStatus()).toContain(
          "status is deployed. Enter again to apply it.",
        ),
      );
      // A value already picked, typed again, applies the clause as it is.
      type(findPart("Value for status"), "dep");
      press(findPart("Value for status"), "Enter");
      await waitFor(() => expect(queryPart("Value for status")).toBeNull());
      expect(findChip("status is deployed")).toBeInTheDocument();
    });

    it("says the values in the order the chip shows them, and nothing for a clause already held", async () => {
      mount({ query: "pool=gpu" });
      await screen.findByRole("button", { name: "gpu" });
      const operator = await startOn("status");
      press(operator, "Enter");
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      type(value as HTMLInputElement, "rea");
      press(value, "Enter");
      type(findPart("Value for status"), "dep");
      press(findPart("Value for status"), "Enter");
      press(findPart("Value for status"), "Enter");
      await waitFor(() =>
        expect(readStatus()).toContain(
          "Added status is any of deployed, ready.",
        ),
      );
      // Building pool is gpu again adds nothing and says nothing.
      const pool = await startOn("pool");
      press(pool, "Enter");
      const poolValue = await screen.findByRole("combobox", {
        name: "Value for pool",
      });
      type(poolValue as HTMLInputElement, "gpu");
      press(poolValue, "Enter");
      press(findPart("Value for pool"), "Enter");
      await waitFor(() => expect(queryPart("Value for pool")).toBeNull());
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(readStatus()).not.toContain("Added pool");
    });
  });

  describe("changes from outside", () => {
    it("keeps an edit's Entry and text when another field changes from outside", async () => {
      const { provider } = mount({ query: "status=deployed" });
      fireEvent.click(await screen.findByRole("button", { name: "deployed" }));
      const value = await screen.findByRole("combobox", {
        name: "Value for status",
      });
      act(() => value.focus());
      type(value as HTMLInputElement, "rea");
      act(() => {
        readProviderHost(provider).setPredicate({
          field: "pool",
          operator: "isAny",
          operands: ["gpu"],
        });
      });
      expect(findPart("Value for status")).toHaveFocus();
      expect(findPart("Value for status")).toHaveValue("rea");
      expect(findChip("pool is gpu")).toBeInTheDocument();
    });

    it("follows a change from outside with no copy of what applied", async () => {
      const { provider } = mount({ query: "status=deployed" });
      await screen.findByRole("button", { name: "deployed" });
      act(() => {
        readProviderHost(provider).setPredicate({
          field: "status",
          operator: "isAny",
          operands: ["broken"],
        });
      });
      expect(findChip("status is broken")).toBeInTheDocument();
    });

    it("ends the session when Back moves the query", async () => {
      const location = createMemoryLocation({ href: "/hosts" });
      mount({ location });
      await startOn("status");
      act(() => {
        location.write(new URLSearchParams("q=web"));
      });
      await waitFor(() => expect(findChip("status")).toBeNull());
    });
  });

  describe("render counts", () => {
    it("re-renders only the chip whose clause a commit changed", async () => {
      const provider = createDataViewsProvider({
        collection,
        source: createArraySource<Host>({ rows: hosts, collection }),
        snapshot: { query: "status=deployed&pool=gpu", presentation: {} },
      });
      render(
        <DataViews provider={provider}>
          <QueryBar />
        </DataViews>,
      );
      const pool = await screen.findByRole("button", { name: "gpu" });
      const status = screen.getByRole("button", { name: "deployed" });
      chipRenders.length = 0;
      act(() => {
        readProviderHost(provider).setPredicate({
          field: "status",
          operator: "isAny",
          operands: ["ready"],
        });
      });
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "ready" })).toBe(status),
      );
      expect(screen.getByRole("button", { name: "gpu" })).toBe(pool);
      // The status chip rendered, and the bar itself did not.
      expect(chipRenders).toEqual(["status__isAny__0"]);
      // A change to the chips' ids renders the bar.
      chipRenders.length = 0;
      act(() => {
        readProviderHost(provider).removePredicate("pool", "isAny", 0);
      });
      await waitFor(() => expect(chipRenders).toContain("bar"));
    });
  });
});
