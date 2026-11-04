import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../storybook/decorators.js";
import { consumerCode } from "../../../storybook/machines/consumerCode.js";
import { createPendingSource } from "../../../storybook/machines/fixtures.js";
import readPaginationSummary from "../../../storybook/machines/readPaginationSummary.js";
import {
  type MachineProviderConfig,
  useMachineProvider,
} from "../../../storybook/machines/story-utils.js";
import type { DataChartProps } from "../DataChart/index.js";
import type { DataTableColumn } from "../DataTable/index.js";
import { DataChartWithTable as ConnectedChartWithTable } from "../DataViews/common/DataChartWithTable/index.js";
import { DataViews } from "../DataViews/index.js";
import Component from "./DataChartWithTable.js";

const meta = {
  title: "_work_in_progress/Renderers/DataChartWithTable",
  component: Component,
  decorators: [withAppScope],
  argTypes: {
    provider: { control: false },
    chartProps: { control: false },
    tableProps: { control: false },
    messages: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/** The table's columns, in every story. */
const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
];

/** What a story chooses of the chart: its type, its field and its caption. */
type ChartProps = Pick<
  DataChartProps<readonly SchemaFieldDefinition[]>,
  "type" | "field" | "label"
>;

/** The counts every story but one draws. */
const statusCounts: ChartProps = {
  type: "bar",
  field: "status",
  label: "Machines by status",
};

/** The import every story's code shows for a part not yet on the root. */
const prototypeImports = `import { machineCollection, machines } from "./machines.js";
// A work-in-progress prototype: not yet exported from the package root.
import { DataChartWithTable } from "./DataChartWithTable.js";`;

/** The columns every story's code declares. */
const columnsCode = `const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
];`;

/** The chart and its table over a provider bound to the story's own source. */
function MachineChartWithTable({
  chart,
  options,
}: {
  readonly chart: ChartProps;
  readonly options?: MachineProviderConfig | undefined;
}): ReactElement {
  const provider = useMachineProvider({
    facets: ["status", "cores"],
    ...options,
  });
  return (
    <Component
      provider={provider}
      chartProps={chart}
      tableProps={{
        columns,
        label: "Machines",
        rowLabel: (row) => String(row["name"]),
      }}
    />
  );
}

/**
 * The chart first, with its table a press away: "Chart" and "Table" after
 * the drawing at the inline end, the chosen one pressed. Both read one
 * provider, so choosing asks the source for nothing.
 */
export const Default: Story = {
  render: () => <MachineChartWithTable chart={statusCounts} />,
  parameters: consumerCode({
    parts: ["type DataTableColumn"],
    imports: prototypeImports,
    facets: ["status", "cores"],
    declarations: columnsCode,
    render: `<DataChartWithTable
  provider={provider}
  chartProps={{ type: "bar", field: "status", label: "Machines by status" }}
  tableProps={{ columns, label: "Machines" }}
/>`,
  }),
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("figure", { name: "Machines by status" }),
    ).toBeVisible();
    const choice = canvas.getByRole("group", { name: "Show as" });
    await expect(
      within(choice).getByRole("button", { name: "Chart" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(
      within(choice).getByRole("button", { name: "Table" }),
    );
    await expect(
      await canvas.findByRole("table", { name: "Machines" }),
    ).toBeVisible();
    await userEvent.click(
      within(choice).getByRole("button", { name: "Chart" }),
    );
    await expect(
      await canvas.findByRole("figure", { name: "Machines by status" }),
    ).toBeVisible();
  },
};

/** A number field's range in place of the counts, with the same table. */
export const RangeOrTable: Story = {
  render: () => (
    <MachineChartWithTable
      chart={{ type: "range", field: "cores", label: "Machines by cores" }}
    />
  ),
  parameters: consumerCode({
    parts: ["type DataTableColumn"],
    imports: prototypeImports,
    facets: ["status", "cores"],
    declarations: columnsCode,
    render: `<DataChartWithTable
  provider={provider}
  chartProps={{ type: "range", field: "cores", label: "Machines by cores" }}
  tableProps={{ columns, label: "Machines" }}
/>`,
  }),
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("img", {
        name: "Machines by cores: a range chart from 2 to 64",
      }),
    ).toBeVisible();
  },
};

/** The connected chart with its table, beside the filters and the pagination. */
function BesideFiltersMachines(): ReactElement {
  const provider = useMachineProvider({
    query: "page=1&size=5",
    facets: ["status", "cores"],
  });
  return (
    <DataViews provider={provider}>
      <DataViews.Filters />
      <ConnectedChartWithTable
        chartProps={statusCounts}
        tableProps={{
          columns,
          label: "Machines",
          rowLabel: (row) => String(row["name"]),
        }}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </DataViews>
  );
}

/**
 * Beside the filters: keeping only the failed machines narrows the table,
 * while the chart, shown again, still counts every status, since a facet
 * lifts its own field's filter.
 */
export const BesideFilters: Story = {
  render: () => <BesideFiltersMachines />,
  parameters: consumerCode({
    parts: ["DataViews", "type DataTableColumn"],
    imports: `import { machineCollection, machines } from "./machines.js";
// A work-in-progress prototype: not yet exported from the package root.
import { DataChartWithTable } from "./DataViews/DataChartWithTable.js";`,
    query: "page=1&size=5",
    facets: ["status", "cores"],
    declarations: columnsCode,
    render: `<DataViews provider={provider}>
  <DataViews.Filters />
  <DataChartWithTable
    chartProps={{ type: "bar", field: "status", label: "Machines by status" }}
    tableProps={{ columns, label: "Machines" }}
  />
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
    const choice = canvas.getByRole("group", { name: "Show as" });
    await userEvent.click(
      within(choice).getByRole("button", { name: "Table" }),
    );
    await waitFor(() =>
      expect(readPaginationSummary(canvas)).toHaveTextContent(
        "Showing 1–3 out of 3 rows",
      ),
    );
    await userEvent.click(
      within(choice).getByRole("button", { name: "Chart" }),
    );
    const counts = await canvas.findByRole("table", {
      name: "Machines by status, as a table",
    });
    await expect(
      within(counts).getByRole("rowheader", { name: "running" })
        .nextElementSibling,
    ).toHaveTextContent("6");
  },
};

/** Loading: the source has not answered, so the chart shows the status. */
export const Loading: Story = {
  render: () => (
    <MachineChartWithTable
      chart={statusCounts}
      options={{ source: createPendingSource }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Loading…")).toBeVisible();
  },
};
