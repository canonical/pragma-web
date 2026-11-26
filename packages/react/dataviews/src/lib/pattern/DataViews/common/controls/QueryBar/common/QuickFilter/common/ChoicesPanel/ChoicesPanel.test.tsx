/**
 * A choice's panel over the quick filters' hosts: its options and counts,
 * each tick committing at once, the search past ten options, the move to
 * the other set operator, and what it says while options load or none are
 * left.
 */
import {
  createDataViewsProvider,
  type DataViewsProvider,
  declareCapabilities,
  type SchemaFieldDefinition,
  type SourceRefusal,
} from "@canonical/dataviews-core";
import {
  buildPage,
  createManualSource,
} from "@canonical/dataviews-core/testing";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useMemo } from "react";
import { describe, expect, it, vi } from "vitest";
import type { QuickHost } from "../../../../../../../../../../../testing/index.js";
import {
  createQuickFilterProvider,
  quickHostCollection,
  quickHosts,
} from "../../../../../../../../../../../testing/index.js";
import { useDataViewsValue } from "../../../../../../../../../hooks/index.js";
import DataViews from "../../../../../../../Provider.js";
import { useQueryGroup } from "../../../../hooks/index.js";
import type { QueryStateStandIn } from "../../../../types.js";
import { isSameConjuncts, listFieldConjuncts } from "../../utils/index.js";
import ChoicesPanel from "./ChoicesPanel.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

/** The panel of one choice, reading its field's conjuncts as a quick filter does. */
function Host({
  provider,
  field,
  named,
  onCommit,
}: {
  readonly provider: Provider;
  readonly field: string;
  readonly named: boolean;
  readonly onCommit: (refusals: readonly SourceRefusal[]) => void;
}) {
  const group = useQueryGroup({ provider });
  const select = useMemo(
    () => (state: QueryStateStandIn) => listFieldConjuncts(state, field),
    [field],
  );
  const conjuncts = useDataViewsValue(group.state, select, isSameConjuncts);
  const definition = provider.collection.schema.findField(field) as Extract<
    SchemaFieldDefinition,
    { readonly kind: "choices" }
  >;
  return (
    <ChoicesPanel
      definition={definition}
      label={field}
      conjuncts={conjuncts}
      group={group}
      named={named}
      onCommit={onCommit}
      onInvalid={vi.fn()}
    />
  );
}

const mount = ({
  field = "status",
  query,
  named = false,
  provider = createQuickFilterProvider({
    facets: ["status"],
    ...(query === undefined ? {} : { query }),
  }) as unknown as Provider,
}: {
  readonly field?: string;
  readonly query?: string;
  readonly named?: boolean;
  readonly provider?: Provider;
} = {}) => {
  const onCommit = vi.fn();
  render(
    <DataViews provider={provider}>
      <Host
        provider={provider}
        field={field}
        named={named}
        onCommit={onCommit}
      />
    </DataViews>,
  );
  return { provider, onCommit };
};

const readFilter = (provider: Provider) => provider.state.get().slice.filter;
const findBox = (name: RegExp | string) =>
  screen.getByRole("checkbox", { name });

describe("ChoicesPanel", () => {
  describe("its options", () => {
    it("lists each option with its count as part of its name, under the set's phrase", () => {
      mount();
      expect(
        screen.getByRole("group", { name: "status is any of" }),
      ).toBeInTheDocument();
      expect(findBox(/^deployed\s?,\s?3$/)).not.toBeChecked();
      expect(findBox(/^broken\s?,\s?3$/)).toBeInTheDocument();
      expect(screen.queryByRole("searchbox")).toBeNull();
    });

    it("counts none where the facet lists no record holding an option", () => {
      mount({ query: "pool=pool-01" });
      expect(findBox(/^ready\s?,\s?0$/)).toBeInTheDocument();
    });

    it("lists no count where the field is not counted", () => {
      mount({ field: "tags" });
      expect(findBox("ex-gpu")).toBeInTheDocument();
    });

    it("names each checkbox as the wire spells the set, where asked", () => {
      mount({ named: true, query: "status__isNone=broken" });
      expect(findBox(/^ready/)).toHaveAttribute("name", "status__isNone");
    });
  });

  describe("a tick", () => {
    it("commits each tick at once, and the last untick removes the set", () => {
      const { provider } = mount();
      fireEvent.click(findBox(/^deployed/));
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed"] },
      ]);
      fireEvent.click(findBox(/^ready/));
      expect(findBox(/^deployed/)).toBeChecked();
      expect(readFilter(provider)).toEqual([
        {
          field: "status",
          operator: "isAny",
          operands: ["deployed", "ready"],
        },
      ]);
      fireEvent.click(findBox(/^deployed/));
      fireEvent.click(findBox(/^ready/));
      expect(readFilter(provider)).toEqual([]);
    });

    it("edits a standing none-of set", () => {
      const { provider } = mount({ query: "status__isNone=broken" });
      expect(
        screen.getByRole("group", { name: "status is none of" }),
      ).toBeInTheDocument();
      expect(findBox(/^broken/)).toBeChecked();
      fireEvent.click(findBox(/^ready/));
      expect(readFilter(provider)).toEqual([
        {
          field: "status",
          operator: "isNone",
          operands: ["broken", "ready"],
        },
      ]);
    });

    it("says why a tick was refused, and keeps the query", () => {
      const capabilities = declareCapabilities(quickHostCollection, {
        filter: { status: ["isAny"], zone: ["isAny"] },
        facets: ["zone"],
      });
      const source = createManualSource<QuickHost>({
        capabilities,
        listRefusals: ({ slice }) =>
          slice.filter.some(({ operands }) => operands.includes("broken"))
            ? [
                {
                  part: "filter",
                  code: "unsupported-combination",
                  field: "status",
                  operator: "isAny",
                  reason: "broken hosts are hidden",
                },
              ]
            : [],
      });
      const { provider, onCommit } = mount({
        provider: createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
      });
      fireEvent.click(findBox("broken"));
      expect(onCommit).toHaveBeenCalledWith([
        expect.objectContaining({ reason: "broken hosts are hidden" }),
      ]);
      expect(readFilter(provider)).toEqual([]);
      // A tick the source takes is heard with no refusal.
      fireEvent.click(findBox("ready"));
      expect(onCommit).toHaveBeenLastCalledWith([]);
    });

    it("offers no option to add where the source declares no set", () => {
      const capabilities = declareCapabilities(quickHostCollection, {
        filter: { zone: ["isAny"] },
        facets: ["zone"],
      });
      const source = createManualSource<QuickHost>({ capabilities });
      mount({
        provider: createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
      });
      expect(findBox("ready")).toBeDisabled();
    });
  });

  it("starts a none-of set where the source offers no any-of", () => {
    const source = createManualSource<QuickHost>({
      capabilities: declareCapabilities(quickHostCollection, {
        filter: { status: ["isNone"], zone: ["isAny"] },
        facets: ["zone"],
      }),
      answer: () => buildPage(quickHosts),
    });
    const { provider } = mount({
      provider: createDataViewsProvider({
        collection: quickHostCollection,
        source: source.source,
        facets: ["zone"],
      }) as unknown as Provider,
    });
    expect(
      screen.getByRole("group", { name: "status is none of" }),
    ).toBeInTheDocument();
    fireEvent.click(findBox("broken"));
    expect(readFilter(provider)).toEqual([
      { field: "status", operator: "isNone", operands: ["broken"] },
    ]);
  });

  describe("the move to the other set", () => {
    it("moves a standing set to none of, then back, as one edit each", () => {
      const { provider } = mount({ query: "status=ready" });
      fireEvent.click(
        screen.getByRole("button", { name: "Match none of these instead" }),
      );
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isNone", operands: ["ready"] },
      ]);
      fireEvent.click(
        screen.getByRole("button", { name: "Match any of these instead" }),
      );
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
    });

    it("offers no move while no set stands", () => {
      mount();
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("the search", () => {
    it("narrows past ten options, and Up and Down move through it and the list", () => {
      mount({ field: "pool" });
      const search = screen.getByRole("searchbox", {
        name: "Search pool options",
      });
      // Its name shows on screen too.
      expect(search).toHaveAttribute("placeholder", "Search pool options");
      const said = screen.getByRole("status");
      expect(said).toHaveTextContent("");
      fireEvent.change(search, { target: { value: " POOL-1 " } });
      expect(said).toHaveTextContent("3 options");
      expect(
        screen.getAllByRole("checkbox").map((box) => box.getAttribute("value")),
      ).toEqual(["pool-10", "pool-11", "pool-12"]);
      act(() => search.focus());
      fireEvent.keyDown(search, { key: "ArrowDown" });
      expect(findBox("pool-10")).toHaveFocus();
      fireEvent.keyDown(findBox("pool-10"), { key: "ArrowDown" });
      expect(findBox("pool-11")).toHaveFocus();
      fireEvent.keyDown(findBox("pool-11"), { key: "ArrowUp" });
      fireEvent.keyDown(findBox("pool-10"), { key: "ArrowUp" });
      expect(search).toHaveFocus();
      fireEvent.keyDown(search, { key: "ArrowUp" });
      expect(search).toHaveFocus();
      // Past the last, focus stays.
      act(() => findBox("pool-12").focus());
      fireEvent.keyDown(findBox("pool-12"), { key: "ArrowDown" });
      expect(findBox("pool-12")).toHaveFocus();
      // Other keys, and keys from outside the stops, pass by.
      const tab = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      });
      findBox("pool-12").dispatchEvent(tab);
      expect(tab.defaultPrevented).toBe(false);
    });

    it("says so where the search leaves no option", () => {
      mount({ field: "pool" });
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "nothing" },
      });
      expect(
        screen.getByText("No options", { selector: "p.status" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("No options");
    });

    it("lets keys from a control that is no stop pass by", () => {
      mount({ query: "status=ready" });
      const move = screen.getByRole("button", {
        name: "Match none of these instead",
      });
      const down = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      move.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(false);
    });
  });

  describe("the server's options", () => {
    it("lists those its facet lists, beside any the set holds", () => {
      mount({ field: "zone", query: "zone=north" });
      expect(
        screen.getAllByRole("checkbox").map((box) => box.getAttribute("value")),
      ).toEqual(["east", "west", "north"]);
    });

    it("lists what the field holds, or says there is nothing, where no facet comes", () => {
      const capabilities = declareCapabilities(quickHostCollection, {
        filter: { zone: ["isAny"] },
        facets: ["zone"],
      });
      // The source answers pages without the facet it could not compute.
      const source = createManualSource<QuickHost>({
        capabilities,
        answer: () => buildPage(quickHosts),
      });
      const provider = createDataViewsProvider({
        collection: quickHostCollection,
        source: source.source,
        facets: ["zone"],
        snapshot: { query: "zone=north", presentation: {} },
      }) as unknown as Provider;
      mount({ field: "zone", provider });
      expect(screen.queryByText("Loading options")).toBeNull();
      expect(findBox("north")).toBeChecked();
      fireEvent.click(findBox("north"));
      expect(screen.getByText("No options")).toBeInTheDocument();
    });

    it("says none arrived where the facet lists none", () => {
      const capabilities = declareCapabilities(quickHostCollection, {
        filter: { zone: ["isAny"] },
        facets: ["zone"],
      });
      const source = createManualSource<QuickHost>({ capabilities });
      mount({
        field: "zone",
        provider: createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
      });
      act(() => {
        source.readLatest().deliver({
          status: "succeeded",
          page: {
            ...buildPage(quickHosts),
            facets: { zone: { kind: "values", values: [] } },
          },
        });
      });
      expect(screen.getByRole("status")).toHaveTextContent("No options");
    });

    it("says they load until a result lists them", () => {
      const capabilities = declareCapabilities(quickHostCollection, {
        filter: { zone: ["isAny"] },
        facets: ["zone"],
      });
      const source = createManualSource<QuickHost>({ capabilities });
      mount({
        field: "zone",
        provider: createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
      });
      const said = screen.getByRole("status");
      expect(said).toHaveTextContent("Loading options");
      expect(screen.queryByRole("checkbox")).toBeNull();
      // The same region says how many arrived.
      act(() => {
        source.readLatest().deliver({
          status: "succeeded",
          page: {
            ...buildPage(quickHosts),
            facets: {
              zone: {
                kind: "values",
                values: [
                  { value: "east", count: { kind: "exact", value: 6 } },
                  { value: "west", count: { kind: "exact", value: 6 } },
                ],
              },
            },
          },
        });
      });
      expect(screen.getByRole("status")).toBe(said);
      expect(said).toHaveTextContent("2 options");
      expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    });
  });
});
