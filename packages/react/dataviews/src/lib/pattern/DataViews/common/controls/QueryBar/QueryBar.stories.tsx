import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { BarStoryArgs } from "../../../../../../storybook/bar/index.js";
import {
  countRows,
  readFrameQuery,
  renderBarWith,
  ServerRenderedBar,
} from "../../../../../../storybook/bar/index.js";
import { withAppScope } from "../../../../../../storybook/decorators/index.js";
import pickStoryWords from "../../../../../../storybook/pickStoryWords.js";
import DataViews from "../../../Provider.js";
import {
  DataTable,
  type DataTableColumn,
} from "../../renderers/DataTable/index.js";
import Component from "./QueryBar.js";

const meta = {
  title: "patterns/DataViews/Controls/QueryBar",
  tags: ["experimental"],
  component: Component,
  decorators: [withAppScope],
  // The suggestions are a popover in the top layer, which escapes every
  // container, so each docs preview gets its own iframe.
  parameters: {
    docs: { story: { inline: false, iframeHeight: "560px" } },
  },
} satisfies Meta<BarStoryArgs>;

export default meta;
type Story = StoryObj<BarStoryArgs>;

/** The bar's own entry. */
const findEntry = (canvasElement: HTMLElement): HTMLElement =>
  within(canvasElement).getByRole("combobox", { name: "Filter records" });

/**
 * Default: the bar at rest over sixty machines. Focus the field to see the
 * fields; type to narrow them, and Enter or a click to start a clause.
 */
export const Default: Story = {
  render: renderBarWith(),
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
  render: renderBarWith({ query: "status=deployed" }),
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
  render: renderBarWith(),
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
  render: renderBarWith({
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
  render: renderBarWith({
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
  render: renderBarWith({
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
  render: renderBarWith({ query: "status=deployed", withOutsideChange: true }),
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
  render: renderBarWith({
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
function StatusAliasInstances({
  messages,
  ...args
}: BarStoryArgs): ReactElement {
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
  render: renderBarWith({
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
  render: renderBarWith({
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
  render: renderBarWith({ query: "memory__gte=131072&memory__lte=65536" }),
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
  render: renderBarWith({ query: "memory__gte=65536" }),
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
  render: renderBarWith({ href: "/machines?status=melted&tags=ex-gpu" }),
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
  render: renderBarWith(),
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
