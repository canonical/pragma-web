import type { Source } from "@canonical/dataviews-core";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  withAppScope,
  withMachineRoot,
} from "../../../../../../storybook/decorators/index.js";
import {
  answerBehind,
  createRestHandlers,
} from "../../../../../../storybook/machines/api/index.js";
import type {
  Machine,
  MachineProviderConfig,
} from "../../../../../../storybook/machines/index.js";
import {
  createMachineSource,
  createPendingSource,
  machineCollection,
  readPaginationSummary,
  SERVER_BACKED_FACETS,
  showConsumerCode,
  useMachineProvider,
} from "../../../../../../storybook/machines/index.js";
import { createRestMachineSource } from "../../../../../../storybook/machines/sources/index.js";
import pickStoryWords from "../../../../../../storybook/pickStoryWords.js";
import type { StoryWords } from "../../../../../../storybook/types.js";
import { DataViews } from "../../../index.js";
import { createColumns } from "../DataTable/index.js";
import Component from "./DataChart.js";
import { ConnectedDataChart as ConnectedChart } from "./index.js";
import type { DataChartType } from "./types.js";

const meta = {
  title: "patterns/DataViews/Renderers/DataChart",
  tags: ["experimental"],
  component: Component,
  decorators: [withAppScope],
  args: {
    type: "bar",
    field: "status",
    label: "Machines by status",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["bar", "range"] },
    provider: { control: false },
    renderStatus: { control: false },
  },
  // The REST-backed stories' endpoint, served through the Storybook MSW
  // addon before a story first renders. Every story here carries it, so a
  // docs page that renders them all together never clears it.
  parameters: { msw: { handlers: createRestHandlers({ latency: 300 }) } },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/** The table beside the chart. */
const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "cores", header: "Cores" },
  ],
});

/** The import every story's code shows for a part not yet on the root. */
const prototypeImports = `import { machineCollection, machines } from "./machines.js";
// A work-in-progress prototype: not yet exported from the package root.
import { DataChart } from "./DataChart.js";`;

/** The import a connected chart's code shows. */
const connectedImports = `import { machineCollection, machines } from "./machines.js";
// A work-in-progress prototype: not yet exported from the package root.
import { DataChart } from "./DataViews/DataChart.js";`;

/** The chart over a provider bound to the story's own source, in its words. */
function MachineChart({
  type,
  field,
  label,
  options,
  ...words
}: StoryWords & {
  readonly type: DataChartType;
  readonly field: string;
  readonly label: string;
  readonly options?: MachineProviderConfig | undefined;
}): ReactElement {
  const provider = useMachineProvider({
    facets: ["status", "cores"],
    ...options,
  });
  return (
    <Component
      {...words}
      provider={provider}
      type={type}
      field={field}
      label={label}
    />
  );
}

/**
 * Status counts: a bar per status, as long as the number of machines holding
 * it, counted by the source over every machine the query matches. The numbers
 * are in the table that follows the drawing.
 */
export const StatusCounts: Story = {
  name: "Status counts",
  render: ({ type, field, label, messages }) => (
    <MachineChart
      type={type}
      field={field}
      label={label}
      {...pickStoryWords({ messages })}
    />
  ),
  parameters: showConsumerCode({
    // A prototype: nothing of it is exported from the package root to name.
    parts: [],
    imports: prototypeImports,
    facets: ["status"],
    render: `<DataChart provider={provider} type="bar" field="status" label="Machines by status" />`,
  }),
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("img", {
        name: "Machines by status: a bar chart of how many records hold each value",
      }),
    ).toBeVisible();
  },
};

/**
 * Cores range: the fewest and the most cores any machine the query matches
 * holds, measured by the source, drawn as a band on an axis that starts at
 * the field's declared minimum. Both values are in the table that follows.
 */
export const CoresRange: Story = {
  name: "Cores range",
  args: { type: "range", field: "cores", label: "Cores" },
  render: ({ type, field, label, messages }) => (
    <MachineChart
      type={type}
      field={field}
      label={label}
      {...pickStoryWords({ messages })}
    />
  ),
  parameters: showConsumerCode({
    parts: [],
    imports: prototypeImports,
    facets: ["cores"],
    render: `<DataChart provider={provider} type="range" field="cores" label="Cores" />`,
  }),
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("img", {
        name: "Cores: a range chart from 2 to 64",
      }),
    ).toBeVisible();
  },
};

/** The counts beside the filters, a table and its pagination, inside the story's root. */
function CountsBesideFiltersMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  return (
    <>
      <DataViews.Filters />
      <ConnectedChart type="bar" field="status" label={label} />
      <DataViews.DataTable
        columns={columns}
        label="Machines"
        getRowLabel={(row) => row.name}
        footer={<DataViews.Pagination sizes={[5, 10]} />}
      />
    </>
  );
}

/**
 * Counts beside the filters: keeping only the failed machines narrows the
 * table, while the chart keeps every status's count, since a facet lifts its
 * own field's filter. The chart is never drawn from the page of rows on
 * screen.
 */
export const CountsBesideFilters: Story = {
  name: "Counts beside filters",
  decorators: [
    withMachineRoot({ query: "page=1&size=5", facets: ["status", "cores"] }),
  ],
  render: ({ label }) => <CountsBesideFiltersMachines label={label} />,
  parameters: showConsumerCode({
    parts: ["DataViews", "createColumns"],
    imports: connectedImports,
    query: "page=1&size=5",
    facets: ["status", "cores"],
    declarations: `const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "cores", header: "Cores" },
  ],
});`,
    render: `<DataViews provider={provider}>
  <DataViews.Filters />
  <DataChart type="bar" field="status" label="Machines by status" />
  <DataViews.DataTable
    columns={columns}
    label="Machines"
    footer={<DataViews.Pagination sizes={[5, 10]} />}
  />
</DataViews>`,
  }),
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(readPaginationSummary(canvas)).toHaveTextContent(
        "Showing 1–5 out of 12 rows",
      ),
    );
    await userEvent.click(canvas.getByRole("checkbox", { name: /^failed/ }));
    await waitFor(() =>
      expect(readPaginationSummary(canvas)).toHaveTextContent(
        "Showing 1–3 out of 3 rows",
      ),
    );
    const table = canvas.getByRole("table", {
      name: "Machines by status, as a table",
    });
    await expect(
      within(table).getByRole("rowheader", { name: "running" })
        .nextElementSibling,
    ).toHaveTextContent("6");
  },
};

/** The range beside the filters, inside the story's root. */
function RangeBesideFiltersMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  return (
    <>
      <DataViews.Filters />
      <ConnectedChart type="range" field="cores" label={label} />
    </>
  );
}

/**
 * The range beside the filters: keeping only the failed machines narrows the
 * range to the cores those machines hold, since the source measures it over
 * every machine the query matches.
 */
export const RangeBesideFilters: Story = {
  name: "Range beside filters",
  args: { type: "range", field: "cores", label: "Cores" },
  decorators: [withMachineRoot({ facets: ["status", "cores"] })],
  render: ({ label }) => <RangeBesideFiltersMachines label={label} />,
  parameters: showConsumerCode({
    parts: ["DataViews"],
    imports: connectedImports,
    facets: ["status", "cores"],
    render: `<DataViews provider={provider}>
  <DataViews.Filters />
  <DataChart type="range" field="cores" label="Cores" />
</DataViews>`,
  }),
  play: async ({ canvas }) => {
    await canvas.findByRole("img", {
      name: "Cores: a range chart from 2 to 64",
    });
    await userEvent.click(canvas.getByRole("checkbox", { name: /^failed/ }));
    await waitFor(() =>
      expect(
        canvas.getByRole("img", { name: "Cores: a range chart from 2 to 8" }),
      ).toBeVisible(),
    );
  },
};

/** Loading: the source has not answered, so the chart says so and draws nothing. */
export const Loading: Story = {
  render: ({ type, field, label, messages }) => (
    <MachineChart
      type={type}
      field={field}
      label={label}
      options={{ source: createPendingSource }}
      {...pickStoryWords({ messages })}
    />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Loading…")).toBeVisible();
  },
};

/** The machines, answering the opening query and holding any other. */
const createRefreshingSource = (): Source<Machine> => {
  const source = createMachineSource();
  let opening: string | undefined;
  return {
    ...source,
    execute: (request, deliver) => {
      const slice = JSON.stringify(request.slice);
      opening ??= slice;
      return slice === opening
        ? source.execute(request, deliver)
        : () => undefined;
    },
  };
};

/**
 * Refreshing: a filter asks the source again, which holds the answer, so the
 * chart says "Loading…" above its last drawing, kept mounted and hidden.
 */
export const Refreshing: Story = {
  decorators: [
    withMachineRoot({
      query: "page=1&size=5",
      facets: ["status", "cores"],
      source: createRefreshingSource,
    }),
  ],
  render: ({ label }) => (
    <>
      <DataViews.Filters />
      <ConnectedChart type="bar" field="status" label={label} />
    </>
  ),
  play: async ({ canvas }) => {
    const chart = within(
      await canvas.findByRole("figure", { name: "Machines by status" }),
    );
    const name = "Machines by status, as a table";
    await chart.findByRole("table", { name });
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: /^failed/ }),
    );
    await expect(await chart.findByText("Loading…")).toBeVisible();
    await expect(chart.queryByRole("table", { name })).toBeNull();
    await expect(
      chart.getByRole("table", { name, hidden: true }),
    ).toBeInTheDocument();
  },
};

/**
 * Render the story inside a root over the REST endpoint, which computes its
 * facets, starting on `query` when one is given.
 */
const wrapInRestBackedRoot = (query?: string): Decorator =>
  withMachineRoot({
    source: () => createRestMachineSource("live"),
    ...(query === undefined ? {} : { query }),
    facets: SERVER_BACKED_FACETS,
  });

/**
 * Counts over REST: the same chart over a REST endpoint reached through
 * TanStack Query. The endpoint counts each status over every machine it
 * matches, and the chart draws what it answers.
 */
export const CountsRestBacked: Story = {
  name: "Counts REST backed",
  decorators: [wrapInRestBackedRoot("page=1&size=5")],
  render: ({ label }) => (
    <ConnectedChart type="bar" field="status" label={label} />
  ),
  play: async ({ canvas }) => {
    await answerBehind("rest");
    const table = await canvas.findByRole("table", {
      name: "Machines by status, as a table",
    });
    await expect(
      within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent),
    ).toEqual(["running", "failed", "pending"]);
  },
};

/**
 * The range over REST: the endpoint measures the cores over every machine it
 * matches, and the chart draws the range it answers.
 */
export const RangeRestBacked: Story = {
  name: "Range REST backed",
  args: { type: "range", field: "cores", label: "Cores" },
  decorators: [wrapInRestBackedRoot()],
  render: ({ label }) => (
    <ConnectedChart type="range" field="cores" label={label} />
  ),
  play: async ({ canvas }) => {
    await answerBehind("rest");
    await expect(
      await canvas.findByRole("img", {
        name: "Cores: a range chart from 2 to 64",
      }),
    ).toBeVisible();
  },
};
