import {
  createArraySource,
  createDataViewsProvider,
  type DataViewsProvider,
  declareCapabilities,
  type SourceDelivery,
} from "@canonical/dataviews-core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import {
  ACTIVITY_MAPPING,
  ACTIVITY_PAGE,
  type Activity,
  type ActivityFields,
  activities,
  activity,
  createActivityProvider,
} from "../../../../testing/activities.js";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import { COUNTED_EXACTLY, pageOf } from "../../../../testing/fixtures.js";
import readAnnouncements from "../../../../testing/readAnnouncements.js";
import silenceRenderErrors from "../../../../testing/silenceRenderErrors.js";
import { DataTable } from "../DataTable/index.js";
import Timeline from "./Timeline.js";
import type { TimelineProps, TimelineRenderContext } from "./types.js";

type Props = Partial<TimelineProps<ActivityFields, Activity>>;

/** A timeline whose source answers every request at once with `answered`. */
const loadedTimeline = (
  answered: readonly Activity[] = ACTIVITY_PAGE,
  extra: Props = {},
) => {
  const { provider, source } = createActivityProvider({ rows: answered });
  const view = render(
    <Timeline
      provider={provider}
      mapping={ACTIVITY_MAPPING}
      label="Activity"
      {...extra}
    />,
  );
  return { provider, source, view };
};

/** A timeline over a source the test answers by hand. */
const manualTimeline = (extra: Props = {}) => {
  const { provider, source } = createActivityProvider();
  const view = render(
    <Timeline
      provider={provider}
      mapping={ACTIVITY_MAPPING}
      label="Activity"
      {...extra}
    />,
  );
  return { provider, source, view };
};

const failure = (reason: string): SourceDelivery<Activity> => ({
  status: "failed",
  failure: { reason, cause: new Error(reason), transient: null },
});

const readRegion = (): HTMLElement =>
  screen.getByRole("region", { name: "Activity" });

/** The descriptions of the events drawn, in order. */
const readDrawn = (): readonly (string | undefined)[] =>
  within(readRegion())
    .queryAllByRole("listitem")
    .filter((item) => !item.classList.contains("expansion"))
    .map((item) => item.querySelector(".payload")?.textContent);

describe("Timeline", () => {
  it("refuses a value that is not a provider", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <Timeline
          provider={{} as DataViewsProvider<ActivityFields, Activity>}
          mapping={ACTIVITY_MAPPING}
          label="Activity"
        />,
      ),
    ).toThrow(
      "Timeline requires a provider created by createDataViewsProvider",
    );
  });

  it("refuses to read its dates from a field that is not a date field", () => {
    silenceRenderErrors();
    const { provider } = createActivityProvider();
    for (const dateTime of ["summary", "nowhere"]) {
      expect(() =>
        render(
          <Timeline
            provider={provider}
            mapping={{ ...ACTIVITY_MAPPING, dateTime }}
            label="Activity"
          />,
        ),
      ).toThrow(
        `Timeline reads its dates from "${dateTime}", which is not a date field`,
      );
    }
  });

  it("draws one event per record on the page, in the order the query puts them", () => {
    loadedTimeline([...ACTIVITY_PAGE].reverse());
    expect(readDrawn()).toEqual([
      "push a-5",
      "push a-4",
      "approval a-3",
      "comment a-2",
      "comment a-1",
    ]);
  });

  it("reads each event's parts through the mapping", () => {
    loadedTimeline([activity("a-1", 1)]);
    const item = within(readRegion()).getByRole("listitem");
    expect(within(item).getByText("Jane Doe")).toHaveClass("actor");
    expect(item.querySelector("time")).toHaveAttribute(
      "datetime",
      "2024-06-01T09:00:00Z",
    );
  });

  it("sizes the markers over the page's runs of one actor and one kind", () => {
    const { view } = loadedTimeline();
    const sizes = [
      ...view.container.querySelectorAll(".data-timeline-marker"),
    ].map((marker) => marker.classList[2]);
    expect(sizes).toEqual(["large", "medium", "medium", "large", "medium"]);
  });

  it("draws every marker at the one size a single-size combination names", () => {
    const { view } = loadedTimeline(ACTIVITY_PAGE, {
      markerCombination: "small",
    });
    expect(
      view.container.querySelectorAll(".data-timeline-marker.small"),
    ).toHaveLength(5);
  });

  it("adds what decorate gives each event, calling the latest one", () => {
    const { provider, source } = createActivityProvider();
    const view = render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        decorate={() => ({ marker: { initials: "OLD" } })}
      />,
    );
    view.rerender(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        decorate={(row) => ({ marker: { initials: row.actor.toUpperCase() } })}
      />,
    );
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([activity("a-1", 1)]),
      });
    });
    expect(screen.getByText("JANE")).toBeInTheDocument();
    expect(screen.queryByText("OLD")).toBeNull();
  });

  it("reads the events again under a mapping naming other fields", () => {
    const { provider } = createActivityProvider({ rows: [activity("a-1", 1)] });
    const view = render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
      />,
    );
    view.rerender(
      <Timeline
        provider={provider}
        mapping={{ ...ACTIVITY_MAPPING, description: "kind" }}
        label="Activity"
      />,
    );
    expect(readDrawn()).toEqual(["comment"]);
  });

  it("offers checkboxes only where selectable", () => {
    loadedTimeline();
    expect(screen.queryAllByRole("checkbox")).toEqual([]);
  });

  it("selects a record from its event's checkbox, named by its description", () => {
    const { provider } = loadedTimeline(ACTIVITY_PAGE, { selectable: true });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select push a-4" }));
    expect([...provider.selection.state.get().ids]).toEqual(["a-4"]);
    expect(
      screen.getByRole("checkbox", { name: "Select push a-4" }),
    ).toBeChecked();
  });

  it("names an event's checkbox by the caller's label, or its event label or identity", () => {
    loadedTimeline([activity("a-1", 1)], {
      selectable: true,
      rowLabel: (row, rowId) => `${row.actorName} ${rowId}`,
    });
    expect(
      screen.getByRole("checkbox", { name: "Select Jane Doe a-1" }),
    ).toBeInTheDocument();
    const { provider } = createActivityProvider({ rows: [activity("a-2", 2)] });
    render(
      <Timeline
        provider={provider}
        mapping={{ dateTime: "at", eventLabel: "kind" }}
        label="Labelled"
        selectable
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: "Select comment" }),
    ).toBeInTheDocument();
    const { provider: bare } = createActivityProvider({
      rows: [activity("a-3", 3)],
    });
    render(
      <Timeline
        provider={bare}
        mapping={{ dateTime: "at" }}
        label="Bare"
        selectable
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: "Select a-3" }),
    ).toBeInTheDocument();
  });

  it("selects every event on the page at once, keeping a selection made elsewhere", () => {
    const { provider } = loadedTimeline(ACTIVITY_PAGE, { selectable: true });
    provider.selection.add(["elsewhere"]);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select all displayed rows" }),
    );
    expect([...provider.selection.state.get().ids].sort()).toEqual([
      "a-1",
      "a-2",
      "a-3",
      "a-4",
      "a-5",
      "elsewhere",
    ]);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select all displayed rows" }),
    );
    expect([...provider.selection.state.get().ids]).toEqual(["elsewhere"]);
  });

  it("shows part of the page selected as mixed", () => {
    loadedTimeline(ACTIVITY_PAGE, { selectable: true });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select push a-4" }));
    expect(
      screen.getByRole("checkbox", { name: "Select all displayed rows" }),
    ).toHaveProperty("indeterminate", true);
  });

  it("shares one selection with a table over the same provider", () => {
    const { provider } = createActivityProvider({ rows: ACTIVITY_PAGE });
    render(
      <>
        <Timeline
          provider={provider}
          mapping={ACTIVITY_MAPPING}
          label="Activity"
          selectable
        />
        <DataTable
          provider={provider}
          columns={[{ id: "summary", header: "Summary" }]}
          label="Activity table"
          selectable
          rowLabel={(row) => row.summary}
        />
      </>,
    );
    const [onEvent, inTable] = screen.getAllByRole("checkbox", {
      name: "Select push a-4",
    });
    fireEvent.click(onEvent as HTMLElement);
    expect(inTable).toBeChecked();
  });

  it("says it is loading while nothing has arrived, busy and drawing no event", () => {
    manualTimeline();
    expect(readRegion()).toHaveAttribute("aria-busy", "true");
    expect(
      readRegion().querySelector("[data-status='pending']"),
    ).toHaveTextContent("Loading…");
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("says why a failed request left no events", () => {
    const { source } = manualTimeline();
    act(() => {
      source.latest().deliver(failure("the log is unreachable"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "These rows could not be loaded: the log is unreachable",
    );
    expect(screen.queryByRole("list")).toBeNull();
    expect(readRegion()).toHaveAttribute("aria-busy", "false");
  });

  it("keeps the events of an earlier query under stale, and says so", () => {
    const { provider, source } = manualTimeline();
    act(() => {
      source
        .latest()
        .deliver({ status: "succeeded", page: pageOf(ACTIVITY_PAGE) });
    });
    act(() => {
      provider.setSort([{ field: "at", direction: "desc" }]);
    });
    act(() => {
      source.latest().deliver(failure("the log is unreachable"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "These rows do not match the current query: the log is unreachable",
    );
    expect(readDrawn()).toHaveLength(5);
  });

  it("says the collection holds nothing, in the caller's own words", () => {
    loadedTimeline([], {
      renderStatus: (status) => `nothing: ${status.status}`,
    });
    expect(screen.getByRole("status")).toHaveTextContent("nothing: no-data");
  });

  it("collapses a long page below its first events, revealing the rest on request", () => {
    const page = Array.from({ length: 10 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    loadedTimeline(page);
    expect(readDrawn()).toHaveLength(8);
    expect(screen.getByText("2 hidden")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show 2 more" }));
    expect(readDrawn()).toHaveLength(10);
    expect(screen.queryByText("2 hidden")).toBeNull();
  });

  it("collapses between the first and last events under the middle method", () => {
    const page = Array.from({ length: 6 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    loadedTimeline(page, {
      expansion: { method: "middle", initialVisible: 4 },
    });
    expect(readDrawn()).toEqual([
      "comment a-1",
      "comment a-2",
      "comment a-5",
      "comment a-6",
    ]);
    const items = within(readRegion()).getAllByRole("listitem");
    expect(items[2]).toHaveClass("expansion");
  });

  it("shows every event without an expansion", () => {
    const page = Array.from({ length: 10 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    loadedTimeline(page, { expansion: false });
    expect(readDrawn()).toHaveLength(10);
    expect(screen.queryByText(/hidden/u)).toBeNull();
  });

  it("collapses a new page again, keeping what a refresh of the same page revealed", () => {
    const page = Array.from({ length: 10 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    const { provider, source } = manualTimeline();
    act(() => {
      source.latest().deliver({ status: "succeeded", page: pageOf(page) });
    });
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    act(() => {
      provider.refresh();
    });
    act(() => {
      source.latest().deliver({ status: "succeeded", page: pageOf(page) });
    });
    expect(readDrawn()).toHaveLength(10);
    act(() => {
      provider.setSort([{ field: "at", direction: "desc" }]);
    });
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([...page].reverse()),
      });
    });
    expect(readDrawn()).toHaveLength(8);
  });

  it("leads each event with its date where asked", () => {
    const { view } = loadedTimeline([activity("a-1", 1)], {
      dateTimePosition: "leading",
    });
    expect(
      view.container.querySelector(".data-timeline-event")?.firstElementChild,
    ).toHaveClass("data-timeline-datetime");
  });

  it("speaks the caller's words over English", () => {
    const page = Array.from({ length: 10 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    loadedTimeline(page, { messages: { showAllEvents: "Everything" } });
    expect(
      screen.getByRole("button", { name: "Everything" }),
    ).toBeInTheDocument();
  });

  it("draws its controls where the source allows them, and none when asked", () => {
    loadedTimeline();
    expect(screen.getByText("Filter by:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actor" })).toBeInTheDocument();
    const { provider } = createActivityProvider({ rows: ACTIVITY_PAGE });
    render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Bare"
        showControls={false}
      />,
    );
    expect(
      screen
        .getByRole("region", { name: "Bare" })
        .querySelector(".data-timeline-header"),
    ).toBeNull();
  });

  it("draws no controls where the source allows none", () => {
    const { provider } = createActivityProvider({
      rows: ACTIVITY_PAGE,
      capabilities: declareCapabilities(activities, {
        counts: COUNTED_EXACTLY,
      }),
      facets: [],
    });
    render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
      />,
    );
    expect(document.querySelector(".data-timeline-header")).toBeNull();
  });

  it("filters the collection from its header, asking the source again", () => {
    const { provider, source } = loadedTimeline(ACTIVITY_PAGE, {});
    const asked = source.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Actor" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "John Roe" }));
    expect(provider.state.get().slice.filter).toEqual([
      { field: "actor", operator: "isAny", operands: ["john"] },
    ]);
    expect(source.calls.length).toBe(asked + 1);
  });

  it("orders the collection from its header, saying so through its own announcer", async () => {
    const { provider } = loadedTimeline(ACTIVITY_PAGE, {
      dateTimeLabel: "When",
    });
    fireEvent.click(screen.getByRole("button", { name: "Order by date" }));
    expect(provider.state.get().slice.sort).toEqual([
      { field: "at", direction: "desc" },
    ]);
    expect(screen.getByRole("button", { name: "Latest" })).toBeInTheDocument();
    expect((await readAnnouncements()).at(-1)).toBe(
      "Sorted by When, descending.",
    );
  });

  it("says politely how many of the page's events it shows", () => {
    const page = Array.from({ length: 10 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    const { view } = loadedTimeline(page);
    const line = view.container.querySelector(".showing");
    expect(line).toHaveAttribute("aria-live", "polite");
    expect(line).toHaveTextContent("Showing 8 of 10 events");
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(line).toHaveTextContent("Showing 10 of 10 events");
  });

  it("says it shows none of none while nothing has arrived", () => {
    const { view } = manualTimeline();
    expect(view.container.querySelector(".showing")).toHaveTextContent(
      "Showing 0 of 0 events",
    );
  });

  it("draws a trailing node last, the connector running on to it", () => {
    const { view } = loadedTimeline(ACTIVITY_PAGE, {
      trailing: <button type="button">Load earlier activity</button>,
    });
    const region = readRegion();
    expect(region).toHaveClass("has-trailing");
    expect(region.lastElementChild).toHaveClass("trailing");
    expect(region.lastElementChild).toHaveTextContent("Load earlier activity");
    view.unmount();
    loadedTimeline();
    expect(readRegion()).not.toHaveClass("has-trailing");
    expect(readRegion().querySelector(".trailing")).toBeNull();
  });

  it("draws each event through renderItem, handing it the event's context", () => {
    const renderItem = vi.fn(
      (item: { readonly id: string }, context: { readonly index: number }) => (
        <span className="mine">{`${item.id}@${context.index}`}</span>
      ),
    );
    loadedTimeline(ACTIVITY_PAGE, { renderItem });
    expect(
      [...readRegion().querySelectorAll(".item .mine")].map(
        (drawn) => drawn.textContent,
      ),
    ).toEqual(["a-1@0", "a-2@1", "a-3@2", "a-4@3", "a-5@4"]);
    expect(readRegion().querySelector(".data-timeline-event")).toBeNull();
    const [item, context] = renderItem.mock.calls.at(-1) ?? [];
    expect(item).not.toHaveProperty("name");
    expect(context).toEqual({
      order: null,
      isVisible: true,
      isFiltered: false,
      markerSize: "medium",
      index: 4,
      control: null,
    });
  });

  it("counts renderItem's positions over the page, past a collapsed middle", () => {
    const page = Array.from({ length: 6 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1),
    );
    const indices: number[] = [];
    loadedTimeline(page, {
      expansion: { method: "middle", initialVisible: 4 },
      renderItem: (_item, { index }) => {
        indices.push(index);
        return null;
      },
    });
    expect(indices.slice(-4)).toEqual([0, 1, 4, 5]);
    expect(readRegion().querySelectorAll(".item:not(.expansion)")).toHaveLength(
      4,
    );
  });

  it("hands renderItem the order, the restriction and the record's checkbox", () => {
    const contexts: TimelineRenderContext[] = [];
    const { provider } = loadedTimeline(ACTIVITY_PAGE, {
      selectable: true,
      renderItem: (item, context) => {
        contexts.push(context);
        return (
          <div>
            {context.control}
            {item.id}
          </div>
        );
      },
    });
    expect(
      screen.getByRole("checkbox", { name: "Select push a-4" }),
    ).toBeInTheDocument();
    act(() => {
      provider.setSort([{ field: "at", direction: "desc" }]);
    });
    expect(contexts.at(-1)?.order).toBe("newest");
    act(() => {
      provider.setSort([{ field: "at", direction: "asc" }]);
    });
    expect(contexts.at(-1)?.order).toBe("oldest");
    fireEvent.click(screen.getByRole("button", { name: "Actor" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Jane Doe" }));
    expect(contexts.at(-1)?.isFiltered).toBe(true);
  });

  it("counts a search as a restriction", () => {
    const contexts: TimelineRenderContext[] = [];
    const { provider } = createActivityProvider({
      rows: ACTIVITY_PAGE,
      capabilities: declareCapabilities(activities, {
        search: ["summary"],
        counts: COUNTED_EXACTLY,
      }),
      facets: [],
    });
    render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        renderItem={(_item, context) => {
          contexts.push(context);
          return null;
        }}
      />,
    );
    expect(contexts.at(-1)?.isFiltered).toBe(false);
    act(() => {
      provider.setSearch("push");
    });
    expect(contexts.at(-1)?.isFiltered).toBe(true);
  });

  it("reports the page's events whenever they change, to the latest callback", () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { provider, source } = createActivityProvider();
    const view = render(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        onVisibleItemsChange={first}
      />,
    );
    expect(first).toHaveBeenLastCalledWith([]);
    view.rerender(
      <Timeline
        provider={provider}
        mapping={ACTIVITY_MAPPING}
        label="Activity"
        onVisibleItemsChange={latest}
      />,
    );
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf(ACTIVITY_PAGE.slice(0, 2)),
      });
    });
    const [reported] = latest.mock.calls.at(-1) ?? [];
    expect(reported.map(({ id }: { readonly id: string }) => id)).toEqual([
      "a-1",
      "a-2",
    ]);
    expect(reported[0]).not.toHaveProperty("name");
    expect(first).toHaveBeenCalledTimes(1);
  });

  it("names its root by its label, spreading and merging the caller's props", () => {
    loadedTimeline(ACTIVITY_PAGE, {
      className: "mine",
      "data-testid": "timeline",
    } as Props);
    const region = readRegion();
    expect(region).toHaveClass("ds", "data-timeline", "mine");
    expect(region).toHaveAttribute("data-testid", "timeline");
  });

  it("has no axe violation, selectable and collapsed", async () => {
    const page = Array.from({ length: 10 }, (_unused, at) =>
      activity(`a-${at + 1}`, at + 1, at < 5 ? "jane" : "john"),
    );
    const { view } = loadedTimeline(page, { selectable: true });
    await expectNoAxeViolations(view.container);
  });
});

describe("Timeline dates", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.UTC(2024, 5, 3, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("switches every event's date between the absolute and relative forms at once", () => {
    loadedTimeline(ACTIVITY_PAGE.slice(0, 2), {
      dateTimeFormats: { timeZone: "UTC", tooltip: false },
    });
    const [first] = screen.getAllByRole("button", { pressed: false });
    fireEvent.click(first as HTMLElement);
    expect(
      screen
        .getAllByRole("button", { pressed: true })
        .map((date) => date.textContent),
    ).toEqual(["2 days ago", "yesterday"]);
  });
});

describe("Timeline hydrating what the server drew", () => {
  it("draws the events, dates and checkboxes the server drew, with no mismatch", async () => {
    const errors = vi.spyOn(console, "error");
    onTestFinished(() => {
      errors.mockRestore();
    });
    const build = () => {
      const provider = createDataViewsProvider({
        collection: activities,
        source: createArraySource({
          rows: ACTIVITY_PAGE,
          collection: activities,
        }),
        facets: ["actor", "kind"],
      });
      provider.refresh();
      return (
        <Timeline
          provider={provider}
          mapping={ACTIVITY_MAPPING}
          label="Activity"
          selectable
          dateTimeFormats={{ timeZone: "UTC" }}
        />
      );
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(build());
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    expect(container.innerHTML).toContain("comment a-1");
    const recovered = vi.fn();
    await act(async () => {
      const root = hydrateRoot(container, build(), {
        onRecoverableError: recovered,
      });
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(recovered).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(within(container).getAllByRole("listitem")).toHaveLength(5);
  });
});
