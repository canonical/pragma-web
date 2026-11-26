import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  createPlatformLocation,
  type DataViewsProvider,
  type PlatformLocation,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { renderToString } from "react-dom/server";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../../../storybook/decorators/index.js";
import {
  barMachineCollection,
  barMachines,
} from "../../../../../storybook/machines/fixtures.js";
import type { BarMachine } from "../../../../../storybook/machines/types.js";
import pickStoryWords from "../../../../../storybook/pickStoryWords.js";
import type { StoryWords } from "../../../../../storybook/types.js";
import { DataTable, type DataTableColumn } from "../../../DataTable/index.js";
import DataViews from "../../Provider.js";
import { ActionBar } from "../ActionBar/index.js";
import Component from "./QueryBar.js";
import type { DataViewsQueryBarProps } from "./types.js";

/** The part's props, and the words the story's root speaks. */
type StoryArgs = DataViewsQueryBarProps & StoryWords;

const meta = {
  title: "_work_in_progress/DataViews/QueryBar",
  component: Component,
  decorators: [withAppScope],
  // The suggestions are a popover in the top layer, which escapes every
  // container, so each docs preview gets its own iframe.
  parameters: {
    docs: { story: { inline: false, iframeHeight: "560px" } },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

/** The machines' provider, as an application builds one. */
type BarProvider = DataViewsProvider<
  typeof barMachineCollection.schema.fields,
  BarMachine
>;

const columns: readonly DataTableColumn[] = [
  { id: "hostname", header: "Host" },
  { id: "status", header: "Status" },
  { id: "memory", header: "Memory (MiB)" },
  { id: "tags", header: "Tags" },
  { id: "owner", header: "Owner" },
  { id: "deployed", header: "Deployed" },
];

/** How one story's machines start. */
type BarConfig = {
  /** The query the provider starts on, as canonical text. */
  readonly query?: string;
  /** A width that makes the chips overflow. */
  readonly inlineSize?: string;
  /** Renders a button that changes the status from outside the bar. */
  readonly withOutsideChange?: boolean;
  /** Keeps the query in the frame's address, so Back and Forward move it. */
  readonly withHistory?: boolean;
  /** A location at this address, which spells addresses for links. */
  readonly href?: string;
  /** Rows selected as the story starts, with the action bar over them. */
  readonly selected?: readonly string[];
};

/**
 * The frame's own address and history as a platform the location reads
 * and writes, so a story's query moves with Back and Forward. Story-only.
 */
const windowPlatform: PlatformLocation = {
  getLocation: () => window.location.href,
  navigate: (url, options) => {
    if (options?.replace === true) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  },
  subscribe: (listener) => {
    const handlePopState = (): void => listener(window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  },
};

/** The frame's own parameters, which a story's query never replaces. */
const FRAME_KEYS: readonly string[] = ["id", "viewMode", "args", "globals"];

/**
 * Start the frame's address on a story's query, so a story that keeps its
 * query there starts from its own, whatever a story before it left.
 * Story-only.
 */
const startFrameAt = (query: string): void => {
  const url = new URL(window.location.href);
  for (const key of [...url.searchParams.keys()]) {
    if (!FRAME_KEYS.includes(key)) url.searchParams.delete(key);
  }
  for (const [key, value] of new URLSearchParams(query)) {
    url.searchParams.append(key, value);
  }
  window.history.replaceState(null, "", url);
};

/** The query bar over the sixty machines, with their table. */
function BarMachines({
  query,
  inlineSize,
  withOutsideChange = false,
  withHistory = false,
  href,
  messages,
  selected,
  ...args
}: StoryArgs & BarConfig): ReactElement {
  const words = pickStoryWords({ messages });
  const [provider] = useState<BarProvider>(() => {
    if (withHistory) startFrameAt(query ?? "");
    const built = createDataViewsProvider({
      collection: barMachineCollection,
      source: createArraySource<BarMachine>({
        rows: barMachines,
        collection: barMachineCollection,
        searchFields: ["hostname"],
      }),
      facets: ["status", "tags"],
      ...(withHistory
        ? { location: createPlatformLocation(windowPlatform) }
        : {}),
      ...(href === undefined
        ? {}
        : { location: createMemoryLocation({ href }) }),
      ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
    });
    if (selected !== undefined) built.selection.add(selected);
    return built;
  });
  return (
    <DataViews provider={provider} {...words}>
      {selected !== undefined && (
        <ActionBar>
          <button type="button">Tag</button>
        </ActionBar>
      )}
      {withOutsideChange && (
        <button
          type="button"
          // A control elsewhere that, like a toolbar's, takes no focus on a
          // press, so the edit in the bar keeps it.
          onPointerDown={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            readProviderHost(provider).setPredicate({
              field: "tags",
              operator: "isAny",
              operands: ["ex-ssd"],
            })
          }
        >
          Show only machines tagged ex-ssd
        </button>
      )}
      <div style={inlineSize === undefined ? undefined : { inlineSize }}>
        <Component {...args} />
      </div>
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        {...words}
        selectable={selected !== undefined}
      />
    </DataViews>
  );
}

/** Render a story's machines as configured. */
const renderWith =
  (config: BarConfig = {}): NonNullable<Story["render"]> =>
  (args) => <BarMachines {...args} {...config} />;

/** The table's record rows: every row but the header's. */
const countRows = (canvasElement: HTMLElement): number =>
  within(canvasElement).getAllByRole("row").length - 1;

/** The bar's own entry. */
const findEntry = (canvasElement: HTMLElement): HTMLElement =>
  within(canvasElement).getByRole("combobox", { name: "Filter records" });

/**
 * Default: the bar at rest over sixty machines. Focus the field to see the
 * fields; type to narrow them, and Enter or a click to start a clause.
 */
export const Default: Story = {
  render: renderWith(),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(countRows(canvasElement)).toBe(50));
    await expect(findEntry(canvasElement)).toHaveValue("");
  },
};

/**
 * The suggestions open: focusing the field lists the fields any operator is
 * offered on.
 */
export const SuggestionsOpen: Story = {
  render: renderWith({ query: "status=deployed" }),
  play: async ({ canvasElement }) => {
    await userEvent.click(findEntry(canvasElement));
    await expect(findEntry(canvasElement)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};

/**
 * Building a chip by keys: a field typed and chosen, its operator, then a
 * value and Enter again. The rows narrow, and focus is back in the entry.
 */
export const BuildAChip: Story = {
  render: renderWith(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(countRows(canvasElement)).toBe(50));
    await userEvent.click(findEntry(canvasElement));
    await userEvent.keyboard("sta{ArrowDown}{Enter}");
    await waitFor(() =>
      expect(
        canvas.getByRole("combobox", { name: "Operator for status" }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        canvas.getByRole("combobox", { name: "Value for status" }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard("dep{Enter}{Enter}");
    await waitFor(() => expect(findEntry(canvasElement)).toHaveFocus());
    await expect(
      canvas.getByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(countRows(canvasElement)).toBe(12));
  },
};

/**
 * Each field kind: a chip on a choice, a list of tags, a number in its
 * display unit, presence, text and a date.
 */
export const EachFieldKind: Story = {
  render: renderWith({
    query:
      "status=deployed&tags=ex-gpu&memory__gte=65536&owner__isSet=true&hostname__contains=node-1&deployed__lte=2026-06-30",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("group", { name: /^memory at least 64.GiB$/ }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("group", { name: "owner has a value" }),
    ).toBeInTheDocument();
  },
};

/** Several values: one chip holding any of three statuses, in canonical order. */
export const SeveralValues: Story = {
  render: renderWith({
    query: "status=deployed&status=ready&status=allocated",
  }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("group", {
        name: "status is any of allocated, deployed, ready",
      }),
    ).toBeInTheDocument();
  },
};

/**
 * Same field, AND: two chips on tags, so a machine holds both, beside one
 * chip holding either.
 */
export const SameFieldAnd: Story = {
  render: renderWith({
    query: "tags=ex-gpu&tags__isAny__1=ex-nvme&status=deployed&status=ready",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("group", { name: "tags is ex-gpu" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("group", { name: "tags is ex-nvme" }),
    ).toBeInTheDocument();
  },
};

/**
 * A change from outside the bar, such as another control, while a chip is
 * being edited: the edit keeps its Entry, its text and focus.
 */
export const OutsideChange: Story = {
  render: renderWith({ query: "status=deployed", withOutsideChange: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "deployed" }),
    );
    const value = await canvas.findByRole("combobox", {
      name: "Value for status",
    });
    await waitFor(() => expect(value).toHaveFocus());
    await userEvent.keyboard("rea");
    await userEvent.click(
      canvas.getByRole("button", { name: "Show only machines tagged ex-ssd" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("group", { name: "tags is ex-ssd" }),
      ).toBeInTheDocument(),
    );
    await expect(value).toHaveFocus();
    await expect(value).toHaveValue("rea");
  },
};

/**
 * Overflow: seven chips in a field just wider than the narrow form hold
 * one line while it is not focused, with the count of those hidden;
 * focusing it wraps them.
 */
export const Overflow: Story = {
  render: renderWith({
    inlineSize: "38rem",
    query:
      "status=deployed&tags=ex-gpu&tags__isAny__1=ex-nvme&memory__gte=8192&memory__lte=65536&owner__isSet=true&hostname__contains=node&deployed__gte=2026-01-01",
  }),
};

/** An instance, shaped after LXD: its status, and the phase it is in. */
type Instance = {
  readonly id: string;
  readonly name: string;
  readonly status: "Running" | "Stopped";
  readonly phase: string;
};

/**
 * The instances' collection: the source reads a starting instance as
 * Running, as LXD's status does, while its phase says Starting.
 */
const instanceCollection = createCollection({
  identify: (instance: Instance) => instance.id,
  fields: [
    { field: "status", kind: "choices", options: ["Running", "Stopped"] },
    { field: "name", kind: "text" },
  ],
});

const instances: readonly Instance[] = [
  { id: "i1", name: "ex-web-1", status: "Running", phase: "Running" },
  { id: "i2", name: "ex-web-2", status: "Running", phase: "Starting" },
  { id: "i3", name: "ex-db-1", status: "Stopped", phase: "Stopped" },
  { id: "i4", name: "ex-db-2", status: "Running", phase: "Starting" },
];

const instanceColumns: readonly DataTableColumn[] = [
  { id: "name", header: "Name" },
  { id: "phase", header: "Phase" },
];

/** The bar over four instances, filtered by status. */
function StatusAliasInstances({ messages, ...args }: StoryArgs): ReactElement {
  const words = pickStoryWords({ messages });
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: instanceCollection,
      source: createArraySource<Instance>({
        rows: instances,
        collection: instanceCollection,
      }),
      snapshot: { query: "status=Running", presentation: {} },
    }),
  );
  return (
    <DataViews provider={provider} {...words}>
      <Component {...args} />
      <DataTable
        provider={provider}
        columns={instanceColumns}
        label="Instances"
        {...words}
      />
    </DataViews>
  );
}

/**
 * Status alias: the chip says what was asked, "status is Running", and the
 * rows say what they are: a starting instance counts as running, so it
 * stays in the result with its own phase beside it.
 */
export const StatusAlias: Story = {
  render: (args) => <StatusAliasInstances {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("group", { name: "status is Running" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(countRows(canvasElement)).toBe(3));
    await expect(canvas.getAllByText("Starting")).toHaveLength(2);
  },
};

/**
 * With the query in the address: each clause added or cleared is a step of
 * history, so Back after the clear control brings the clauses back.
 */
export const WithHistory: Story = {
  render: renderWith({
    query: "status=deployed&status=ready",
    withHistory: true,
  }),
};

/**
 * A range: a field's lower and upper bound as one chip. Each bound edits
 * its own value; removing the chip removes both in one step, which one
 * Back brings back, the query being kept in the frame's address.
 */
export const Range: Story = {
  render: renderWith({
    query: "memory__gte=8192&memory__lte=65536",
    withHistory: true,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("group", {
        name: "memory at least 8\u00a0GiB and at most 64\u00a0GiB",
      }),
    ).toBeInTheDocument();
  },
};

/**
 * A contradiction: a lower bound above the upper. The line below the field
 * warns that nothing matches, and Merge swaps the bounds into one range.
 */
export const Contradiction: Story = {
  render: renderWith({ query: "memory__gte=131072&memory__lte=65536" }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(
        "The memory filters cannot all hold, so nothing matches.",
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Merge the memory filters" }),
    ).toBeVisible();
  },
};

/**
 * Invalid input: a number typed in a unit the field lacks. The Entry is
 * marked, and the line below the field says why, and that what applied
 * still does.
 */
export const InvalidInput: Story = {
  render: renderWith({ query: "memory__gte=65536" }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^64.GiB$/ }));
    const value = canvas.getByRole("combobox", { name: "Value for memory" });
    await userEvent.clear(value);
    await userEvent.type(value, "16 GX{Enter}");
    await expect(value).toHaveAttribute("aria-invalid", "true");
    await expect(
      canvas.getByText(/The previous restriction still applies\./),
    ).toBeVisible();
  },
};

/**
 * A refused link: the address asks for a status the machines lack. The
 * clause shows as a refused chip, its reason described; Clear removes it.
 */
export const RefusedLink: Story = {
  render: renderWith({ href: "/machines?status=melted&tags=ex-gpu" }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Clear status" }),
    ).toHaveAccessibleDescription(/^status: /);
    // The reason shows below the field too.
    const line = canvasElement.querySelector<HTMLElement>(
      ".ds.data-views-query-bar-message-line",
    );
    await expect(line).toHaveTextContent(/^status: .*melted/);
    await expect(line).toBeVisible();
  },
};

/**
 * Presets: named values offered first among a field's values. "Deployed
 * this year" resolves to the year's first day when it is chosen.
 */
export const Presets: Story = {
  args: {
    presets: {
      deployed: [
        {
          label: "Deployed this year",
          resolve: () => ({
            operator: "gte",
            operands: [`${new Date().getFullYear()}-01-01`],
          }),
        },
      ],
      status: [
        {
          label: "Not deployed",
          resolve: () => ({ operator: "isNone", operands: ["deployed"] }),
        },
      ],
    },
  },
  render: renderWith(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(findEntry(canvasElement));
    await userEvent.type(findEntry(canvasElement), "deployed{Enter}");
    const operator = canvas.getByRole("combobox", {
      name: "Operator for deployed",
    });
    await userEvent.type(operator, ">=");
    const value = canvas.getByRole("combobox", { name: "Value for deployed" });
    await waitFor(() => expect(value).toHaveFocus());
    // The field's preset comes first among its values.
    await waitFor(() =>
      expect(
        within(document.body).getAllByRole("option").at(0),
      ).toHaveTextContent("Deployed this year"),
    );
  },
};

/** The query the narrow stories start on: two filter chips, a range once. */
const NARROW_QUERY = "status=deployed&memory__gte=8192&memory__lte=65536";

/** A phone's width, or the frame's where it is narrower still. */
const PHONE_SIZE = "min(22.5rem, 100%)";

/**
 * Mobile: below a container width of 37.5rem the chips give way to the
 * search-only entry and a summary button, "Filters, 2 applied", which
 * opens the sheet: the applied chips, "Add filter" and the filters form,
 * every change applying at once, behind which the rows update. The bar
 * stands at a phone's width.
 */
export const Mobile: Story = {
  render: renderWith({ query: NARROW_QUERY, inlineSize: PHONE_SIZE }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByRole("button", {
      name: "Filters, 2 applied",
    });
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute("command", "show-modal");
  },
};

/**
 * Mobile, the sheet open: the summary button pressed, then "Add filter",
 * and a field chosen, so the sheet shows its operator step.
 */
export const MobileSheetOpen: Story = {
  name: "Mobile: the sheet open",
  render: renderWith({ query: NARROW_QUERY, inlineSize: PHONE_SIZE }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByRole("button", {
      name: "Filters, 2 applied",
    });
    await expect(summary).toBeVisible();
    await userEvent.click(summary);
    const sheet = within(
      await waitFor(() =>
        within(canvasElement.ownerDocument.body).getByRole("dialog", {
          name: "Filter records",
        }),
      ),
    );
    await userEvent.click(sheet.getByRole("button", { name: "Add filter" }));
    await userEvent.click(sheet.getByRole("option", { name: "status" }));
    await expect(
      sheet.getByRole("listbox", { name: "Choose an operator for status" }),
    ).toBeVisible();
  },
};

/**
 * Mobile, rows selected: the action bar over the selection stands above
 * the narrow bar, and neither pushes the page wider than the frame.
 */
export const MobileRowsSelected: Story = {
  name: "Mobile, rows selected",
  render: renderWith({
    query: NARROW_QUERY,
    inlineSize: PHONE_SIZE,
    selected: ["bm-01", "bm-02"],
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 selected")).toBeVisible();
    await expect(
      await canvas.findByRole("button", { name: "Filters, 2 applied" }),
    ).toBeVisible();
  },
};

/** The address a no-scripts story renders, from the frame's own `query`. */
const readFrameQuery = (fallback: string): string =>
  new URLSearchParams(window.location.search).get("query") ?? fallback;

/**
 * The bar's server markup over the machines, at an address or in memory, in
 * the story's words.
 */
function ServerRenderedBar({
  href,
  inlineSize,
  messages,
  ...args
}: StoryArgs & {
  readonly href?: string;
  readonly inlineSize?: string;
}): ReactElement {
  const words = pickStoryWords({ messages });
  const [markup] = useState(() => {
    const provider = createDataViewsProvider({
      collection: barMachineCollection,
      source: createArraySource<BarMachine>({
        rows: barMachines,
        collection: barMachineCollection,
        searchFields: ["hostname"],
      }),
      ...(href === undefined
        ? { snapshot: { query: "status=deployed&q=web", presentation: {} } }
        : { location: createMemoryLocation({ href }) }),
    });
    return renderToString(
      <DataViews provider={provider} {...words}>
        <Component {...args} />
      </DataViews>,
    );
  });
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the frame only re-addresses the server markup's own links and forms, which keep their roles
    // biome-ignore lint/a11y/useKeyWithClickEvents: a link followed by keys fires the same click
    <div
      className="no-scripts"
      style={inlineSize === undefined ? undefined : { inlineSize }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the story shows the server's own markup, before any script takes it over
      dangerouslySetInnerHTML={{ __html: markup }}
      onClick={(event) => {
        const link = (event.target as Element).closest<HTMLAnchorElement>(
          "a[href]",
        );
        if (link === null) return;
        event.preventDefault();
        followInFrame(new URL(link.href).search);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        const params = new URLSearchParams();
        for (const [key, value] of data) params.append(key, String(value));
        followInFrame(`?${params.toString()}`);
      }}
    />
  );
}

/**
 * Follow an address the server's markup spells within the frame: as the
 * story's `query`, the frame's own parameters kept, so the story renders
 * the page that address leads to. Story-only.
 */
const followInFrame = (search: string): void => {
  const url = new URL(window.location.href);
  for (const key of [...url.searchParams.keys()]) {
    if (!FRAME_KEYS.includes(key)) url.searchParams.delete(key);
  }
  url.searchParams.set("query", search.replace(/^\?/, ""));
  window.location.assign(url);
};

/**
 * No JavaScript, with an address: the server's markup. The search is a
 * GET form around a plain input that keeps the filters in hidden fields;
 * each chip's remove control and the clear control are links; the filters
 * form sits in a disclosure, "Filters (n)". The frame's `query` parameter
 * sets the address, so a page with scripting disabled can follow them;
 * here, a followed link or a submitted form renders the page it leads to.
 */
export const NoJavaScriptHref: Story = {
  name: "No JavaScript, with an address",
  render: (args) => (
    <ServerRenderedBar
      {...args}
      href={`/machines?${readFrameQuery("status=deployed&memory__gte=8192&memory__lte=65536&q=web")}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("search")).toHaveAttribute("method", "get");
    await expect(
      canvas.getByRole("link", { name: "Remove status is deployed" }),
    ).toBeVisible();
  },
};

/**
 * No JavaScript, in memory: the same markup with nothing to lead to. No
 * form, no address and no name: the controls show the query, inert, and
 * work once scripts run.
 */
export const NoJavaScriptMemory: Story = {
  name: "No JavaScript, memory",
  render: (args) => <ServerRenderedBar {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("search")).toBeNull();
    await expect(canvas.queryAllByRole("link")).toHaveLength(0);
  },
};

/**
 * No JavaScript, with an address, narrow: the server's markup at 22.5rem.
 * The summary button opens the sheet through its invoker command, with no
 * script; inside, each chip's remove control and Clear all are links, and
 * Apply submits the filters' GET form, which keeps the search.
 */
export const NoJavaScriptNarrow: Story = {
  name: "No JavaScript, with an address, narrow",
  render: (args) => (
    <ServerRenderedBar
      {...args}
      inlineSize="22.5rem"
      href={`/machines?${readFrameQuery(`${NARROW_QUERY}&q=web`)}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Filters, 2 applied" }),
    ).toHaveAttribute("command", "show-modal");
  },
};
