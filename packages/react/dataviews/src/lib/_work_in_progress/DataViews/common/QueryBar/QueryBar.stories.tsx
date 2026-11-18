import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  createPlatformLocation,
  type DataViewsProvider,
  type PlatformLocation,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../../../storybook/decorators.js";
import {
  barMachineCollection,
  barMachines,
} from "../../../../../storybook/machines/fixtures.js";
import type { BarMachine } from "../../../../../storybook/machines/types.js";
import { DataTable, type DataTableColumn } from "../../../DataTable/index.js";
import DataViews from "../../Provider.js";
import Component from "./QueryBar.js";
import type { DataViewsQueryBarProps } from "./types.js";

const meta = {
  title: "_work_in_progress/DataViews/QueryBar",
  component: Component,
  decorators: [withAppScope],
  // The suggestions are a popover in the top layer, which escapes every
  // container, so each docs preview gets its own iframe.
  parameters: {
    docs: { story: { inline: false, iframeHeight: "560px" } },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

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

/** The query bar over the sixty machines, with their table. */
function BarMachines({
  query,
  inlineSize,
  withOutsideChange = false,
  withHistory = false,
  ...args
}: DataViewsQueryBarProps & BarConfig): ReactElement {
  const [provider] = useState<BarProvider>(() =>
    createDataViewsProvider({
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
      ...(query === undefined ? {} : { snapshot: { query, presentation: {} } }),
    }),
  );
  return (
    <DataViews provider={provider}>
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
      <DataTable provider={provider} columns={columns} label="Machines" />
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
 * Overflow: eight chips in a narrow field hold one line while it is not
 * focused, with the count of those hidden; focusing it wraps them.
 */
export const Overflow: Story = {
  render: renderWith({
    inlineSize: "28rem",
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
function StatusAliasInstances(args: DataViewsQueryBarProps): ReactElement {
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
    <DataViews provider={provider}>
      <Component {...args} />
      <DataTable
        provider={provider}
        columns={instanceColumns}
        label="Instances"
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
