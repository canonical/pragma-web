import {
  createMemoryLocation,
  declareCapabilities,
  type SourceRefusal,
} from "@canonical/dataviews-core";
import {
  readProviderHost,
  resolveMessages,
} from "@canonical/dataviews-core/bindings";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import {
  ACTIVITY_MAPPING,
  ACTIVITY_PAGE,
  type Activity,
  type ActivityFields,
  type ActivityProviderConfig,
  activities,
  createActivityProvider,
} from "../../../../../testing/activities.js";
import { COUNTED_EXACTLY } from "../../../../../testing/fixtures.js";
import { ORDERING_TOPIC, SORT_REFUSAL_TOPIC } from "../../../common/index.js";
import type { TimelineFieldMapping } from "../types.js";
import type { UseTimelineHeaderProps } from "./types.js";
import useTimelineHeader from "./useTimelineHeader.js";

const messages = resolveMessages();

const ITEMS = [
  { id: "a-1", dateTime: "", actorId: "jane", actorName: "Jane Doe" },
  { id: "a-2", dateTime: "", eventType: "push", eventLabel: "Pushed" },
];

const refusal = (part: SourceRefusal["part"]): SourceRefusal => ({
  part,
  code: "unsupported-combination",
  field: null,
  operator: null,
  reason: "the log is busy",
});

/** The header over an activity provider answering with the fixture page and its facets. */
type Shown = Pick<
  UseTimelineHeaderProps<ActivityFields, Activity>,
  | "showActorFilter"
  | "showEventFilter"
  | "showSorting"
  | "actorFilterLabel"
  | "eventFilterLabel"
  | "dateTimeLabel"
>;

const renderHeader = ({
  config = {},
  mapping = ACTIVITY_MAPPING,
  shown = {},
}: {
  readonly config?: ActivityProviderConfig;
  readonly mapping?: TimelineFieldMapping;
  readonly shown?: Partial<Shown>;
} = {}) => {
  const { provider, source } = createActivityProvider({
    rows: ACTIVITY_PAGE,
    ...config,
  });
  const announce = vi.fn();
  onTestFinished(provider.observe());
  const hook = renderHook(() =>
    useTimelineHeader({
      provider,
      mapping,
      showActorFilter: true,
      showEventFilter: true,
      showSorting: true,
      actorFilterLabel: "Actor",
      eventFilterLabel: "Event",
      dateTimeLabel: "Date",
      ...shown,
      items: ITEMS,
      messages,
      announce,
    }),
  );
  return { provider, source, announce, ...hook };
};

describe("useTimelineHeader", () => {
  it("offers a filter for the actor and the event type, from the source's facets", () => {
    const { result } = renderHeader({ shown: { actorFilterLabel: "Who" } });
    const [actor, kind] = result.current.filters;
    expect(actor).toMatchObject({
      field: "actor",
      label: "Who",
      refusal: null,
      options: [
        { value: "jane", label: "Jane Doe", applied: false, href: null },
        { value: "john", label: "john", applied: false, href: null },
      ],
    });
    expect(kind).toMatchObject({
      field: "kind",
      label: "Event",
      options: [
        { value: "comment", label: "comment" },
        { value: "approval", label: "approval" },
        { value: "push", label: "Pushed" },
      ].map((option) => expect.objectContaining(option)),
    });
  });

  it("offers neither filter nor the order control where the caller turns them off", () => {
    const { result } = renderHeader({
      shown: {
        showActorFilter: false,
        showEventFilter: false,
        showSorting: false,
      },
    });
    expect(result.current.filters).toEqual([]);
    expect(result.current.order).toBeNull();
  });

  it("keeps a filter the caller turns off out of the reset", () => {
    const { provider, result } = renderHeader({
      shown: { showActorFilter: false },
    });
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "actor",
        operator: "isAny",
        operands: ["jane"],
      });
    });
    expect(result.current.reset).toBeNull();
  });

  it("offers no filter for a part the mapping leaves out", () => {
    const { result } = renderHeader({ mapping: { dateTime: "at" } });
    expect(result.current.filters).toEqual([]);
  });

  it("offers no filter for a field the source cannot restrict to a value, or does not facet", () => {
    const { result } = renderHeader({
      config: {
        capabilities: declareCapabilities(activities, {
          filter: { kind: ["isAny"] },
          sort: { fields: ["at"], terms: 1, tiebreak: "opaque" },
          counts: COUNTED_EXACTLY,
          facets: ["actor"],
        }),
        facets: ["actor"],
      },
    });
    expect(result.current.filters).toEqual([]);
  });

  it("offers no filter while no facet has been answered, or one holds no value", () => {
    const pending = renderHeader({ config: { rows: undefined } });
    expect(pending.result.current.filters).toEqual([]);
    const empty = renderHeader({ config: { rows: [] } });
    expect(empty.result.current.filters).toEqual([]);
  });

  it("restricts the field to the value chosen, and lifts it on choosing that value again", () => {
    const { provider, result } = renderHeader();
    act(() => {
      result.current.filters[0]?.onSelect("jane");
    });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "actor", operator: "isAny", operands: ["jane"] },
    ]);
    expect(
      result.current.filters[0]?.options.map(({ applied }) => applied),
    ).toEqual([true, false]);
    act(() => {
      result.current.filters[0]?.onSelect("john");
    });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "actor", operator: "isAny", operands: ["john"] },
    ]);
    act(() => {
      result.current.filters[0]?.onSelect("john");
    });
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("checks every value a restriction to several holds, and narrows it to the one chosen", () => {
    const { provider, result } = renderHeader();
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "actor",
        operator: "isAny",
        operands: ["jane", "john"],
      });
    });
    expect(
      result.current.filters[0]?.options.map(({ applied }) => applied),
    ).toEqual([true, true]);
    act(() => {
      result.current.filters[0]?.onSelect("jane");
    });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "actor", operator: "isAny", operands: ["jane"] },
    ]);
  });

  it("changes nothing for a value it does not offer", () => {
    const { provider, result } = renderHeader();
    act(() => {
      result.current.filters[0]?.onSelect("nobody");
    });
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("offers a reset only while a filter holds a restriction, lifting every one", () => {
    const { provider, result } = renderHeader();
    expect(result.current.reset).toBeNull();
    act(() => {
      result.current.filters[0]?.onSelect("jane");
    });
    act(() => {
      result.current.filters[1]?.onSelect("push");
    });
    expect(provider.state.get().slice.filter).toHaveLength(2);
    act(() => {
      result.current.reset?.onReset();
    });
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(result.current.reset).toBeNull();
  });

  it("is hydrated once scripts run", () => {
    const { result } = renderHeader();
    expect(result.current.hydrated).toBe(true);
  });

  it("says why a restriction was refused, beside its filter, while the query stands", () => {
    const { provider, result, announce } = renderHeader({
      config: {
        refusals: (query) =>
          query.slice.filter.length > 0 ? [refusal("filter")] : [],
      },
    });
    act(() => {
      result.current.filters[0]?.onSelect("jane");
    });
    const text = messages.filterRefused(["the log is busy"], false);
    expect(result.current.filters[0]?.refusal).toBe(text);
    expect(result.current.filters[1]?.refusal).toBeNull();
    expect(announce).toHaveBeenCalledWith(text);
    act(() => {
      result.current.order?.onToggle();
    });
    expect(result.current.filters[0]?.refusal).toBeNull();
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("keeps a refusal over a standing restriction, and ends it for good when the query moves elsewhere", () => {
    const { provider, result, rerender } = renderHeader({
      config: {
        refusals: (query) =>
          query.slice.sort.length > 0 ? [refusal("sort")] : [],
      },
    });
    act(() => {
      result.current.filters[0]?.onSelect("jane");
    });
    act(() => {
      result.current.order?.onToggle();
    });
    const text = messages.sortRefused(["the log is busy"]);
    rerender();
    expect(result.current.order?.refusal).toBe(text);
    act(() => {
      readProviderHost(provider).removePredicate("actor", "isAny");
    });
    expect(result.current.order?.refusal).toBeNull();
    act(() => {
      readProviderHost(provider).setPredicate({
        field: "actor",
        operator: "isAny",
        operands: ["jane"],
      });
    });
    expect(result.current.order?.refusal).toBeNull();
  });

  it("offers no order control where the source cannot order by the date", () => {
    const { result } = renderHeader({
      config: {
        capabilities: declareCapabilities(activities, {
          sort: { fields: ["kind"], terms: 1, tiebreak: "opaque" },
          counts: COUNTED_EXACTLY,
        }),
        facets: [],
      },
    });
    expect(result.current.order).toBeNull();
  });

  it("toggles the date between newest and oldest first, saying the ordering applied", () => {
    const { provider, result, announce } = renderHeader({
      shown: { dateTimeLabel: "When" },
    });
    expect(result.current.order?.direction).toBeNull();
    act(() => {
      result.current.order?.onToggle();
    });
    expect(provider.state.get().slice.sort).toEqual([
      { field: "at", direction: "desc" },
    ]);
    expect(result.current.order?.direction).toBe("desc");
    expect(announce).toHaveBeenLastCalledWith(
      messages.sortApplied([{ name: "When", direction: "desc" }]),
      ORDERING_TOPIC,
    );
    act(() => {
      result.current.order?.onToggle();
    });
    expect(result.current.order?.direction).toBe("asc");
  });

  it("leads the ordering in force with the date, keeping the rest the source allows", () => {
    const { provider, result, announce } = renderHeader({
      config: {
        capabilities: declareCapabilities(activities, {
          filter: { actor: ["isAny"], kind: ["isAny"] },
          sort: {
            fields: ["at", "kind"],
            terms: null,
            tiebreak: "opaque",
            default: [{ field: "kind", direction: "asc" }],
          },
          counts: COUNTED_EXACTLY,
          facets: ["actor", "kind"],
        }),
      },
    });
    expect(result.current.order?.direction).toBeNull();
    act(() => {
      result.current.order?.onToggle();
    });
    expect(provider.state.get().slice.sort).toEqual([
      { field: "at", direction: "desc" },
      { field: "kind", direction: "asc" },
    ]);
    expect(announce).toHaveBeenLastCalledWith(
      messages.sortApplied([
        { name: "Date", direction: "desc" },
        { name: "kind", direction: "asc" },
      ]),
      ORDERING_TOPIC,
    );
  });

  it("says why an ordering was refused, beside the control, until the query moves", () => {
    const { result, announce } = renderHeader({
      config: {
        refusals: (query) =>
          query.slice.sort.length > 0 ? [refusal("sort")] : [],
      },
    });
    act(() => {
      result.current.order?.onToggle();
    });
    const text = messages.sortRefused(["the log is busy"]);
    expect(result.current.order?.refusal).toBe(text);
    expect(result.current.order?.direction).toBeNull();
    expect(announce).toHaveBeenCalledWith(text, SORT_REFUSAL_TOPIC);
    act(() => {
      result.current.filters[0]?.onSelect("jane");
    });
    expect(result.current.order?.refusal).toBeNull();
  });

  it("leads nowhere without a location", () => {
    const { result } = renderHeader();
    expect(result.current.order?.href).toBeNull();
    expect(result.current.filters[0]?.options[0]?.href).toBeNull();
  });

  it("leads every control, without scripts, to the query its change makes, from the first page", () => {
    const { result } = renderHeader({
      config: {
        location: createMemoryLocation({
          href: "/activity?actor=jane&kind=push&page=2",
        }),
      },
    });
    const read = (href: string | null | undefined) =>
      new URLSearchParams(href ?? "");
    const [jane, john] = result.current.filters[0]?.options ?? [];
    expect(read(jane?.href).getAll("actor")).toEqual([]);
    expect(read(john?.href).getAll("actor")).toEqual(["john"]);
    expect(read(john?.href).getAll("kind")).toEqual(["push"]);
    expect(read(john?.href).get("page")).toBe("1");
    const reset = read(result.current.reset?.href);
    expect(reset.getAll("actor")).toEqual([]);
    expect(reset.getAll("kind")).toEqual([]);
    const ordered = read(result.current.order?.href);
    expect([...ordered.keys()].some((key) => key.includes("sort"))).toBe(true);
    expect(ordered.getAll("actor")).toEqual(["jane"]);
  });
});
