import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { consumerCode } from "../../../storybook/consumerCode.js";
import { withAppScope } from "../../../storybook/decorators.js";
import { machineCollection } from "../../../storybook/machines/fixtures.js";
import { useMachineProvider } from "../../../storybook/machines/story-utils.js";
import { createColumns } from "../DataTable/index.js";
import { DataViews } from "../DataViews/index.js";
import Component from "./RendererSwitch.js";

const meta = {
  title: "_work_in_progress/RendererSwitch",
  component: Component,
  decorators: [withAppScope],
  args: {
    label: "Show machines as",
  },
  argTypes: {
    renderers: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

const detailColumns = createColumns(machineCollection, [
  { field: "name", header: "Host" },
  { field: "status", header: "Status" },
  { field: "region", header: "Region" },
  { field: "cores", header: "Cores" },
  { field: "owner", header: "Owner" },
]);

const summaryColumns = createColumns(machineCollection, [
  { field: "name", header: "Host" },
  { field: "status", header: "Status" },
]);

/** Two renderers over one root: every machine's details, or a summary. */
function TableOrSummaryMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  const provider = useMachineProvider();
  return (
    <DataViews provider={provider}>
      <Component
        label={label}
        renderers={[
          {
            id: "table",
            label: "Table",
            content: (
              <DataViews.DataTable
                columns={detailColumns}
                label="Machines"
                selectable
                rowLabel={(row) => String(row["name"])}
                // One bar serves both renderers, after the switch.
                footer={null}
              />
            ),
          },
          {
            id: "summary",
            label: "Summary",
            content: (
              <DataViews.DataTable
                columns={summaryColumns}
                label="Machines, summarised"
                selectable
                rowLabel={(row) => String(row["name"])}
                footer={null}
              />
            ),
          },
        ]}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </DataViews>
  );
}

/**
 * Table or summary: one collection, two renderers the reader chooses
 * between. Both read the same root, so a machine selected in one stays
 * selected in the other, and choosing asks the source for nothing. The
 * choice lasts while the switch is mounted; it is not written to the URL or
 * to a saved view. Without scripting both renderers are drawn in turn.
 */
export const TableOrSummary: Story = {
  render: ({ label = "Show machines as" }) => (
    <TableOrSummaryMachines label={label} />
  ),
  parameters: consumerCode({
    parts: ["DataViews", "createColumns"],
    imports: `import { machineCollection, machines } from "./machines.js";
// A work-in-progress spike: not yet exported from the package root.
import { RendererSwitch } from "./RendererSwitch.js";`,
    declarations: `const detailColumns = createColumns(machineCollection, [
  { field: "name", header: "Host" },
  { field: "status", header: "Status" },
  { field: "region", header: "Region" },
  { field: "cores", header: "Cores" },
  { field: "owner", header: "Owner" },
]);

const summaryColumns = createColumns(machineCollection, [
  { field: "name", header: "Host" },
  { field: "status", header: "Status" },
]);`,
    render: `<DataViews provider={provider}>
  <RendererSwitch
    label="Show machines as"
    renderers={[
      {
        id: "table",
        label: "Table",
        content: <DataViews.DataTable columns={detailColumns} label="Machines" selectable footer={null} />,
      },
      {
        id: "summary",
        label: "Summary",
        content: <DataViews.DataTable columns={summaryColumns} label="Machines, summarised" selectable footer={null} />,
      },
    ]}
  />
  {/* One bar serves both renderers. */}
  <DataViews.Pagination sizes={[5, 10]} />
</DataViews>`,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: "Select alder.example.com" }),
    );
    const choice = canvas.getByRole("combobox", { name: "Show machines as" });
    await userEvent.selectOptions(choice, "summary");
    const summary = await canvas.findByRole("table", {
      name: "Machines, summarised",
    });
    await waitFor(() =>
      expect(
        within(summary).getByRole("checkbox", {
          name: "Select alder.example.com",
        }),
      ).toBeChecked(),
    );
    await userEvent.selectOptions(choice, "table");
    await canvas.findByRole("table", { name: "Machines" });
  },
};
