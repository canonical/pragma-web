/**
 * One quick filter over the quick filters' hosts: words that commit and
 * mark what applies, a filter button whose count and condition follow its
 * field, the panel each kind edits through, and what it re-renders.
 */
import {
  createDataViewsProvider,
  createMemoryLocation,
  type DataViewsProvider,
  declareCapabilities,
  type QueryLocation,
  type SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import {
  buildPage,
  createManualSource,
} from "@canonical/dataviews-core/testing";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Profiler } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  createQuickFilterProvider,
  expectNoAxeViolations,
  installPopoverStandIn,
  type QuickHost,
  quickHostCollection,
  quickHosts,
} from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../Provider.js";
import { useQueryGroup } from "../../hooks/index.js";
import QuickFilter from "./QuickFilter.js";
import type { QuickFilterArrangement } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

/** Every render of a quick filter's subtree, by field. */
const renders: string[] = [];

/** The quick filters named, each in a profiler counting its renders. */
function Bar({
  provider,
  filters,
  hasHref,
  onRefused,
  onCommitted,
}: {
  readonly provider: Provider;
  readonly filters: readonly (readonly [string, QuickFilterArrangement])[];
  readonly hasHref: boolean;
  readonly onRefused: () => void;
  readonly onCommitted: () => void;
}) {
  const group = useQueryGroup(provider);
  return (
    <>
      {filters.map(([field, arrangement]) => (
        <Profiler
          key={field}
          id={field}
          onRender={(id) => {
            renders.push(id);
          }}
        >
          <QuickFilter
            field={field}
            arrangement={arrangement}
            group={group}
            hasHref={hasHref}
            onRefused={onRefused}
            onCommitted={onCommitted}
            onInvalid={vi.fn()}
          />
        </Profiler>
      ))}
    </>
  );
}

const mount = (
  filters: readonly (readonly [string, QuickFilterArrangement])[],
  {
    query,
    location,
    provider = createQuickFilterProvider({
      ...(query === undefined ? {} : { query }),
      ...(location === undefined ? {} : { location }),
    }) as unknown as Provider,
  }: {
    readonly query?: string;
    readonly location?: QueryLocation;
    readonly provider?: Provider;
  } = {},
) => {
  const onRefused = vi.fn();
  const onCommitted = vi.fn();
  render(
    <DataViews provider={provider}>
      <Bar
        provider={provider}
        filters={filters}
        hasHref={location !== undefined}
        onRefused={onRefused}
        onCommitted={onCommitted}
      />
    </DataViews>,
  );
  return { provider, onRefused, onCommitted };
};

const readFilter = (provider: Provider) => provider.state.get().slice.filter;

describe("QuickFilter", () => {
  describe("as words", () => {
    it("commits a word, moves the mark, and clears with All", () => {
      const { provider, onCommitted } = mount([["status", "words"]]);
      const all = screen.getByRole("button", { name: "All" });
      expect(all).toHaveAttribute("aria-current", "true");
      fireEvent.click(screen.getByRole("button", { name: "deployed" }));
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["deployed"] },
      ]);
      // Said from what the field held before.
      expect(onCommitted).toHaveBeenCalledWith("status", []);
      expect(screen.getByRole("button", { name: "deployed" })).toHaveAttribute(
        "aria-current",
        "true",
      );
      expect(all).not.toHaveAttribute("aria-current");
      fireEvent.click(all);
      expect(readFilter(provider)).toEqual([]);
    });

    it("toggles several words of a list into one any-of set", () => {
      const { provider } = mount([["tags", "words"]]);
      fireEvent.click(screen.getByRole("button", { name: "ex-gpu" }));
      fireEvent.click(screen.getByRole("button", { name: "ex-ssd" }));
      expect(readFilter(provider)).toEqual([
        { field: "tags", operator: "isAny", operands: ["ex-gpu", "ex-ssd"] },
      ]);
      expect(screen.getByRole("button", { name: "ex-gpu" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.queryByRole("button", { name: "All" })).toBeNull();
    });

    it("names an exclusion in the group, marks the excluded value, and leaves All unmarked", () => {
      mount([["status", "words"]], { query: "status__isNone=broken" });
      expect(
        screen.getByRole("group", { name: "status, none of 1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "broken, excluded" }),
      ).toHaveClass("excluded");
      expect(screen.getByRole("button", { name: "All" })).not.toHaveAttribute(
        "aria-current",
      );
    });

    it("makes no commit for the word that already applies alone", () => {
      const { provider, onCommitted } = mount([["status", "words"]]);
      fireEvent.click(screen.getByRole("button", { name: "All" }));
      fireEvent.click(screen.getByRole("button", { name: "ready" }));
      fireEvent.click(screen.getByRole("button", { name: "ready" }));
      expect(onCommitted).toHaveBeenCalledTimes(1);
      expect(readFilter(provider)).toEqual([
        { field: "status", operator: "isAny", operands: ["ready"] },
      ]);
    });

    it("follows a change from outside", () => {
      const { provider } = mount([["status", "words"]]);
      act(() => {
        readProviderHost(provider).setPredicate({
          field: "status",
          operator: "isAny",
          operands: ["ready"],
        });
      });
      expect(screen.getByRole("button", { name: "ready" })).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("draws buttons, not links, once scripts run, at an address too", () => {
      mount([["status", "words"]], {
        location: createMemoryLocation({ href: "/hosts" }),
      });
      expect(screen.queryAllByRole("link")).toHaveLength(0);
      expect(screen.getByRole("button", { name: "ready" })).toBeInTheDocument();
    });

    it("says why a word was refused", () => {
      const source = createManualSource<QuickHost>({
        capabilities: declareCapabilities(quickHostCollection, {
          filter: { status: ["isAny"], zone: ["isAny"] },
          facets: ["zone"],
        }),
        answer: () => buildPage(quickHosts),
        listRefusals: ({ slice }) =>
          slice.filter.length > 0
            ? [
                {
                  part: "filter",
                  code: "unsupported-combination",
                  field: "status",
                  operator: "isAny",
                  reason: "no status filter today",
                },
              ]
            : [],
      });
      const { onRefused } = mount([["status", "words"]], {
        provider: createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
      });
      fireEvent.click(screen.getByRole("button", { name: "ready" }));
      expect(onRefused).toHaveBeenCalledTimes(1);
      // All, with nothing to clear, commits nothing to refuse.
      fireEvent.click(screen.getByRole("button", { name: "All" }));
      expect(onRefused).toHaveBeenCalledTimes(1);
    });
  });

  describe("as a filter button", () => {
    it("counts what its field holds, in the trigger's name", () => {
      const { provider, onCommitted } = mount([["pool", "button"]]);
      const trigger = screen.getByRole("button", { name: "pool" });
      expect(trigger).toHaveClass("filter-button");
      fireEvent.click(
        screen.getByRole("checkbox", { hidden: true, name: "pool-03" }),
      );
      expect(readFilter(provider)).toEqual([
        { field: "pool", operator: "isAny", operands: ["pool-03"] },
      ]);
      expect(
        screen.getByRole("button", { name: "pool, 1 applied" }),
      ).toBeInTheDocument();
      expect(onCommitted).toHaveBeenCalledWith("pool", []);
    });

    it("shows an exclusion's mark and words", () => {
      mount([["status", "button"]], {
        query: "status__isNone=broken&status__isNone=ready",
      });
      const trigger = screen.getByRole("button", {
        name: "status, none of 2",
      });
      expect(
        trigger.querySelector('.mark[data-condition="exclusion"]'),
      ).toHaveAttribute("aria-hidden", "true");
    });

    it("names no condition where its clauses assert different ones", () => {
      mount([["status", "button"]], {
        query: "status=ready&status__isNone=broken",
      });
      const trigger = screen.getByRole("button", { name: "status, 2 applied" });
      expect(trigger.querySelector(".mark")).toBeNull();
    });

    it("opens a presence's panel on its checked radio", async () => {
      mount([["owner", "button"]], { query: "owner__isSet=true" });
      const trigger = screen.getByRole("button", { name: "owner, 1 applied" });
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(
          screen.getByRole("radio", { hidden: true, name: "Has a value" }),
        ).toHaveFocus(),
      );
    });

    it("holds the panel each kind edits through", () => {
      mount([
        ["memory", "button"],
        ["seen", "button"],
        ["name", "button"],
        ["owner", "button"],
      ]);
      expect(
        screen.getAllByRole("textbox", { hidden: true, name: "memory from" }),
      ).toHaveLength(1);
      expect(document.querySelectorAll('input[type="date"]')).toHaveLength(2);
      expect(
        screen.getByRole("textbox", { hidden: true, name: "name contains" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { hidden: true, name: "Has a value" }),
      ).toBeInTheDocument();
    });

    it("puts its panel in a form at an address", () => {
      mount([["status", "button"]], {
        location: createMemoryLocation({ href: "/hosts" }),
      });
      expect(
        document.querySelector(".ds.filter-button-panel form[method=get]"),
      ).not.toBeNull();
      expect(
        screen.getByRole("checkbox", { hidden: true, name: "ready" }),
      ).toHaveAttribute("name", "status");
    });
  });

  describe("accessibility", () => {
    it("has no axe violation as words, or with each kind's panel open", async () => {
      mount([
        ["status", "words"],
        ["pool", "button"],
        ["memory", "button"],
        ["name", "button"],
        ["owner", "button"],
      ]);
      await expectNoAxeViolations(document.body);
      for (const name of ["pool", "memory", "name", "owner"]) {
        const trigger = screen.getByRole("button", { name });
        fireEvent.click(trigger);
        await waitFor(() =>
          expect(
            document
              .getElementById(trigger.getAttribute("aria-controls") ?? "")
              ?.matches(":popover-open"),
          ).toBe(true),
        );
        await expectNoAxeViolations(document.body);
      }
    });
  });

  describe("what it re-renders", () => {
    it("renders the quick filter whose field moved, and not another", () => {
      mount([
        ["status", "words"],
        ["pool", "button"],
      ]);
      renders.length = 0;
      fireEvent.click(screen.getByRole("button", { name: "ready" }));
      expect(renders).toContain("status");
      expect(renders).not.toContain("pool");
    });
  });
});
