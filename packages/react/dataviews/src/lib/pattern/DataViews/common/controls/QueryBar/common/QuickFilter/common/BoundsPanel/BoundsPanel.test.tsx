/**
 * A number's or a date's panel over the quick filters' hosts: each bound
 * committed on Enter or on leaving its input, removed when emptied, and a
 * value that does not read keeping the bound that applied.
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
import { fireEvent, render, screen } from "@testing-library/react";
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
import BoundsPanel from "./BoundsPanel.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

/** The panel of one field, reading its conjuncts as a quick filter does. */
function Host({
  provider,
  field,
  named,
  onCommit,
  onInvalid,
}: {
  readonly provider: Provider;
  readonly field: string;
  readonly named: boolean;
  readonly onCommit: (refusals: readonly SourceRefusal[]) => void;
  readonly onInvalid: (message: string) => void;
}) {
  const group = useQueryGroup({ provider });
  const select = useMemo(
    () => (state: QueryStateStandIn) => listFieldConjuncts(state, field),
    [field],
  );
  const conjuncts = useDataViewsValue(group.state, select, isSameConjuncts);
  const definition = provider.collection.schema.findField(field) as Extract<
    SchemaFieldDefinition,
    { readonly kind: "number" | "date" }
  >;
  return (
    <BoundsPanel
      definition={definition}
      label={field}
      conjuncts={conjuncts}
      group={group}
      named={named}
      onCommit={onCommit}
      onInvalid={onInvalid}
    />
  );
}

const mount = ({
  field = "memory",
  query,
  named = false,
  provider = createQuickFilterProvider(
    query === undefined ? {} : { query },
  ) as unknown as Provider,
}: {
  readonly field?: string;
  readonly query?: string;
  readonly named?: boolean;
  readonly provider?: Provider;
} = {}) => {
  const onCommit = vi.fn();
  const onInvalid = vi.fn();
  render(
    <DataViews provider={provider}>
      <Host
        provider={provider}
        field={field}
        named={named}
        onCommit={onCommit}
        onInvalid={onInvalid}
      />
    </DataViews>,
  );
  return { provider, onCommit, onInvalid };
};

const readFilter = (provider: Provider) => provider.state.get().slice.filter;
const findInput = (name: string) =>
  screen.getByRole<HTMLInputElement>("textbox", { name });
const type = (input: HTMLInputElement, value: string) =>
  fireEvent.change(input, { target: { value } });

describe("BoundsPanel", () => {
  describe("its inputs", () => {
    it("shows each bound as it applies, in its largest unit, with the units it reads", () => {
      mount({ query: "memory__gte=65536" });
      expect(findInput("memory from")).toHaveValue("64\u00a0GiB");
      expect(findInput("memory to")).toHaveValue("");
      expect(findInput("memory from")).toHaveAccessibleDescription(
        "Number, in MiB or GiB",
      );
      expect(findInput("memory from")).not.toHaveAttribute("name");
    });

    it("names each input as the wire spells its bound, where asked", () => {
      mount({ named: true });
      expect(findInput("memory from")).toHaveAttribute("name", "memory__gte");
      expect(findInput("memory to")).toHaveAttribute("name", "memory__lte");
    });

    it("takes a date in a native date input, with no units hint", () => {
      const { provider } = mount({ field: "seen" });
      const [from] =
        document.querySelectorAll<HTMLInputElement>('input[type="date"]');
      expect(from).toBeDefined();
      expect(from).not.toHaveAttribute("aria-describedby");
      fireEvent.change(from as HTMLInputElement, {
        target: { value: "2026-03-01" },
      });
      fireEvent.blur(from as HTMLInputElement);
      expect(readFilter(provider)).toEqual([
        { field: "seen", operator: "gte", operands: ["2026-03-01"] },
      ]);
    });
  });

  it("draws only the bounds the source offers", () => {
    const source = createManualSource<QuickHost>({
      capabilities: declareCapabilities(quickHostCollection, {
        filter: { memory: ["gte"], zone: ["isAny"] },
        facets: ["zone"],
      }),
      answer: () => buildPage(quickHosts),
    });
    mount({
      provider: createDataViewsProvider({
        collection: quickHostCollection,
        source: source.source,
        facets: ["zone"],
      }) as unknown as Provider,
    });
    expect(findInput("memory from")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "memory to" })).toBeNull();
  });

  describe("a date", () => {
    it("reads a date with a part cleared as incomplete, not a removal", () => {
      const { provider, onInvalid } = mount({
        field: "seen",
        query: "seen__gte=2026-03-01",
      });
      const [from] =
        document.querySelectorAll<HTMLInputElement>('input[type="date"]');
      const input = from as HTMLInputElement;
      // A native date input with its day cleared reports an empty value
      // and a bad input.
      Object.defineProperty(input, "validity", {
        configurable: true,
        get: () => ({ badInput: input.value === "" }),
      });
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);
      expect(readFilter(provider)).toEqual([
        { field: "seen", operator: "gte", operands: ["2026-03-01"] },
      ]);
      expect(onInvalid).toHaveBeenCalledWith(
        "Enter a value to change this restriction. The previous restriction still applies.",
      );
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("a commit", () => {
    it("commits a value in a display unit on Enter", () => {
      const { provider, onCommit } = mount();
      type(findInput("memory from"), "64 GiB");
      fireEvent.keyDown(findInput("memory from"), { key: "Enter" });
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [65_536] },
      ]);
      expect(onCommit).toHaveBeenCalledWith([]);
      expect(findInput("memory from")).toHaveValue("64\u00a0GiB");
    });

    it("commits on leaving the input, and only what was typed", () => {
      const { provider } = mount();
      fireEvent.blur(findInput("memory to"));
      expect(readFilter(provider)).toEqual([]);
      type(findInput("memory to"), "8192");
      fireEvent.keyDown(findInput("memory to"), { key: "Tab" });
      expect(readFilter(provider)).toEqual([]);
      fireEvent.blur(findInput("memory to"));
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "lte", operands: [8192] },
      ]);
    });

    it("removes a bound emptied, and commits nothing for an empty one", () => {
      const { provider, onCommit } = mount({ query: "memory__gte=65536" });
      type(findInput("memory to"), " ");
      fireEvent.blur(findInput("memory to"));
      expect(readFilter(provider)).toHaveLength(1);
      expect(onCommit).not.toHaveBeenCalled();
      type(findInput("memory from"), "");
      fireEvent.blur(findInput("memory from"));
      expect(readFilter(provider)).toEqual([]);
    });

    it("keeps the bound that applied for a value that does not read, and says so", () => {
      const { provider, onInvalid } = mount({ query: "memory__gte=65536" });
      type(findInput("memory from"), "lots");
      fireEvent.keyDown(findInput("memory from"), { key: "Enter" });
      // Said once for each commit that fails.
      expect(onInvalid).toHaveBeenCalledTimes(1);
      expect(onInvalid).toHaveBeenCalledWith(
        expect.stringMatching(
          /^Invalid: .+ The previous restriction still applies\.$/,
        ),
      );
      fireEvent.blur(findInput("memory from"));
      expect(onInvalid).toHaveBeenCalledTimes(2);
      expect(readFilter(provider)).toEqual([
        { field: "memory", operator: "gte", operands: [65_536] },
      ]);
      expect(findInput("memory from")).toHaveAttribute("aria-invalid", "true");
      expect(findInput("memory from")).toHaveAccessibleDescription(
        /^Number, in MiB or GiB Invalid: .+ The previous restriction still applies\.$/,
      );
      // Typing again clears the mark.
      type(findInput("memory from"), "6");
      expect(findInput("memory from")).not.toHaveAttribute("aria-invalid");
    });

    it("says a value on its way to one is incomplete", () => {
      mount();
      type(findInput("memory to"), "16 G");
      fireEvent.blur(findInput("memory to"));
      expect(
        screen.getByText("Enter a value to apply this restriction."),
      ).toBeInTheDocument();
    });

    it("says why a bound was refused, and shows the one that applies", () => {
      const source = createManualSource<QuickHost>({
        capabilities: declareCapabilities(quickHostCollection, {
          filter: { memory: ["gte", "lte"], zone: ["isAny"] },
          facets: ["zone"],
        }),
        answer: () => buildPage(quickHosts),
        listRefusals: ({ slice }) =>
          slice.filter.some(({ operands }) => operands.includes(1))
            ? [
                {
                  part: "filter",
                  code: "unsupported-combination",
                  field: "memory",
                  operator: "gte",
                  reason: "too little memory",
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
      type(findInput("memory from"), "1");
      fireEvent.blur(findInput("memory from"));
      expect(onCommit).toHaveBeenCalledWith([
        expect.objectContaining({ reason: "too little memory" }),
      ]);
      expect(readFilter(provider)).toEqual([]);
      expect(findInput("memory from")).toHaveValue("");
    });
  });
});
