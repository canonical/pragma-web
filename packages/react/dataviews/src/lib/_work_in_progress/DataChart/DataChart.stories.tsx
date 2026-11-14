import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../storybook/decorators.js";
import { createRestHandlers } from "../../../storybook/machines/api/index.js";
import { SERVER_BACKED_FACETS } from "../../../storybook/machines/constants.js";
import { consumerCode } from "../../../storybook/machines/consumerCode.js";
import { createPendingSource } from "../../../storybook/machines/fixtures.js";
import readPaginationSummary from "../../../storybook/machines/readPaginationSummary.js";
import { createRestMachineSource } from "../../../storybook/machines/sources/index.js";
import {
  type MachineProviderConfig,
  useMachineProvider,
} from "../../../storybook/machines/story-utils.js";
import type { DataTableColumn } from "../DataTable/index.js";
import { DataChart as ConnectedChart } from "../DataViews/common/DataChart/index.js";
import { DataViews } from "../DataViews/index.js";
import Component from "./DataChart.js";
import type { DataChartType } from "./types.js";

const meta = {
  title: "_work_in_progress/DataViews/Renderers/DataChart",
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
const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
];

/** The import every story's code shows for a part not yet on the root. */
const prototypeImports = `import { machineCollection, machines } from "./machines.js";
// A work-in-progress prototype: not yet exported from the package root.
import { DataChart } from "./DataChart.js";`;

/** The import a connected chart's code shows. */
const connectedImports = `import { machineCollection, machines } from "./machines.js";
// A work-in-progress prototype: not yet exported from the package root.
import { DataChart } from "./DataViews/DataChart.js";`;

/** The chart over a provider bound to the story's own source. */
function MachineChart({
  type,
  field,
  label,
  options,
}: {
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
    <Component provider={provider} type={type} field={field} label={label} />
  );
}

/**
 * Status counts: a bar per status, as long as the number of machines holding
 * it, counted by the source over every machine the query matches. The numbers
 * are in the table that follows the drawing.
 */
export const StatusCounts: Story = {
  render: ({ type, field, label }) => (
    <MachineChart type={type} field={field} label={label} />
  ),
  parameters: consumerCode({
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
  args: { type: "range", field: "cores", label: "Cores" },
  render: ({ type, field, label }) => (
    <MachineChart type={type} field={field} label={label} />
  ),
  parameters: consumerCode({
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

/** The counts beside the filters, a table and its pagination, over one root. */
function CountsBesideFiltersMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  const provider = useMachineProvider({
    query: "page=1&size=5",
    facets: ["status", "cores"],
  });
  return (
    <DataViews provider={provider}>
      <DataViews.Filters />
      <ConnectedChart type="bar" field="status" label={label} />
      <DataViews.DataTable
        columns={columns}
        label="Machines"
        rowLabel={(row) => String(row["name"])}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </DataViews>
  );
}

/**
 * Counts beside the filters: keeping only the failed machines narrows the
 * table, while the chart keeps every status's count, since a facet lifts its
 * own field's filter. The chart is never drawn from the page of rows on
 * screen.
 */
export const CountsBesideFilters: Story = {
  render: ({ label }) => <CountsBesideFiltersMachines label={label} />,
  parameters: consumerCode({
    parts: ["DataViews", "type DataTableColumn"],
    imports: connectedImports,
    query: "page=1&size=5",
    facets: ["status", "cores"],
    declarations: `const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
];`,
    render: `<DataViews provider={provider}>
  <DataViews.Filters />
  <DataChart type="bar" field="status" label="Machines by status" />
  <DataViews.DataTable columns={columns} label="Machines" />
  <DataViews.Pagination sizes={[5, 10]} />
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

/** The range beside the filters, over one root. */
function RangeBesideFiltersMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  const provider = useMachineProvider({ facets: ["status", "cores"] });
  return (
    <DataViews provider={provider}>
      <DataViews.Filters />
      <ConnectedChart type="range" field="cores" label={label} />
    </DataViews>
  );
}

/**
 * The range beside the filters: keeping only the failed machines narrows the
 * range to the cores those machines hold, since the source measures it over
 * every machine the query matches.
 */
export const RangeBesideFilters: Story = {
  args: { type: "range", field: "cores", label: "Cores" },
  render: ({ label }) => <RangeBesideFiltersMachines label={label} />,
  parameters: consumerCode({
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
  render: ({ type, field, label }) => (
    <MachineChart
      type={type}
      field={field}
      label={label}
      options={{ source: createPendingSource }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Loading…")).toBeVisible();
  },
};

/** The chart over the REST endpoint, which computes its facets. */
function RestBackedMachines({
  type,
  field,
  label,
  query,
}: {
  readonly type: DataChartType;
  readonly field: string;
  readonly label: string;
  readonly query?: string;
}): ReactElement {
  const provider = useMachineProvider({
    source: () => createRestMachineSource("live"),
    ...(query === undefined ? {} : { query }),
    facets: SERVER_BACKED_FACETS,
  });
  return (
    <DataViews provider={provider}>
      <ConnectedChart type={type} field={field} label={label} />
    </DataViews>
  );
}

/**
 * Counts over REST: the same chart over a REST endpoint reached through
 * TanStack Query. The endpoint counts each status over every machine it
 * matches, and the chart draws what it answers.
 */
export const CountsRestBacked: Story = {
  render: ({ label }) => (
    <RestBackedMachines
      type="bar"
      field="status"
      label={label}
      query="page=1&size=5"
    />
  ),
  play: async ({ canvas }) => {
    const table = await canvas.findByRole(
      "table",
      { name: "Machines by status, as a table" },
      { timeout: 3000 },
    );
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
  args: { type: "range", field: "cores", label: "Cores" },
  render: ({ label }) => (
    <RestBackedMachines type="range" field="cores" label={label} />
  ),
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole(
        "img",
        { name: "Cores: a range chart from 2 to 64" },
        { timeout: 3000 },
      ),
    ).toBeVisible();
  },
};
