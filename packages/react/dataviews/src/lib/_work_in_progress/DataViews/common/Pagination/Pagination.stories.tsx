import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, waitFor } from "storybook/test";
import {
  withAppScope,
  withMachineRoot,
} from "../../../../../storybook/decorators/index.js";
import showConsumerCode from "../../../../../storybook/machines/showConsumerCode.js";
import type { DataTableColumn } from "../../../DataTable/index.js";
import DataViews from "../../Provider.js";
import Component from "./Pagination.js";
import type { DataViewsPaginationProps } from "./types.js";

const meta = {
  title: "_work_in_progress/DataViews/Pagination",
  component: Component,
  decorators: [withAppScope],
  args: {
    sizes: [5, 10, 25],
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "owner", header: "Owner" },
];

const columnsCode = `const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "owner", header: "Owner" },
];`;

const composition = `<DataViews provider={provider}>
  <DataTable provider={provider} columns={columns} label="Machines" />
  <DataViews.Pagination sizes={[5, 10, 25]} />
</DataViews>`;

/** A composed collection inside the story's root: its table and its pagination part. */
function ComposedMachines(args: DataViewsPaginationProps): ReactElement {
  return (
    <>
      <DataViews.DataTable columns={columns} label="Machines" />
      <Component {...args} />
    </>
  );
}

/** The query the filtered story starts on: failed machines only. */
const onlyFailed = "status=failed&page=1&size=5";

/**
 * In a composition: the part pages the root's provider and takes no provider
 * of its own. It renders exactly what `PaginationBar` renders for that
 * provider.
 */
export const InAComposition: Story = {
  parameters: showConsumerCode({
    parts: ["DataTable", "DataViews", "type DataTableColumn"],
    declarations: columnsCode,
    query: "page=1&size=5",
    render: composition,
  }),
  decorators: [withMachineRoot({ query: "page=1&size=5" })],
  render: (args) => <ComposedMachines {...args} />,
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Showing 1–5 out of 12 rows",
      ),
    );
    await expect(canvas.getByText("of 3 pages")).toBeInTheDocument();
  },
};

/**
 * A filtered total: the provider starts on a query keeping only failed
 * machines, the source counts three, and the part offers the one page they
 * fill. The total it shows is always the current query's.
 */
export const AFilteredTotal: Story = {
  parameters: showConsumerCode({
    parts: ["DataTable", "DataViews", "type DataTableColumn"],
    declarations: columnsCode,
    query: onlyFailed,
    render: composition,
  }),
  decorators: [withMachineRoot({ query: onlyFailed })],
  render: (args) => <ComposedMachines {...args} />,
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Showing 1–3 out of 3 rows",
      ),
    );
    await expect(canvas.getByText("of 1 page")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
  },
};
