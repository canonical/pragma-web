import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../storybook/decorators.js";
import { consumerCode } from "../../../storybook/machines/consumerCode.js";
import { machineCollection } from "../../../storybook/machines/fixtures.js";
import useMachineProvider from "../../../storybook/machines/useMachineProvider.js";
import { useDataViewsValue } from "../../hooks/index.js";
import type { DataTableColumn } from "../DataTable/index.js";
import { useDataViews } from "./hooks/index.js";
import Component from "./Provider.js";

const meta = {
  title: "_work_in_progress/DataViews/DataViews",
  component: Component,
  decorators: [withAppScope],
  argTypes: {
    provider: { control: false },
    messages: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
];

const columnsCode = `const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
];`;

/**
 * The root on its own: one provider mounted for the parts inside it, here a
 * table and its pagination. Neither takes a provider; both read the root.
 */
export const Default: Story = {
  parameters: consumerCode({
    parts: ["DataViews", "type DataTableColumn"],
    imports: `import { machineCollection, machines } from "./machines.js";`,
    declarations: columnsCode,
    query: "page=1&size=5",
    render: `<DataViews provider={provider}>
  <DataViews.DataTable columns={columns} label="Machines" />
  <DataViews.Pagination label="Machines pagination" />
</DataViews>`,
  }),
  render: function Render() {
    const provider = useMachineProvider({ query: "page=1&size=5" });
    return (
      <Component provider={provider}>
        <Component.DataTable columns={columns} label="Machines" />
        <Component.Pagination label="Machines pagination" />
      </Component>
    );
  },
};

/** A child of the application's own, reading the rows the root holds. */
function MachineCount(): ReactElement {
  const { rows } = useDataViews(machineCollection);
  const shown = useDataViewsValue(rows).entries.length;
  return <p>{`${shown} machines on this page`}</p>;
}

/**
 * The application's own child: any component inside the root reads it
 * through `useDataViews`, here to count the rows on the page beside the
 * table that shows them.
 */
export const OwnChild: Story = {
  parameters: consumerCode({
    parts: [
      "DataViews",
      "type DataTableColumn",
      "useDataViews",
      "useDataViewsValue",
    ],
    imports: `import { machineCollection, machines } from "./machines.js";`,
    declarations: `${columnsCode}

function MachineCount() {
  const { rows } = useDataViews(machineCollection);
  const shown = useDataViewsValue(rows).entries.length;
  return <p>{\`\${shown} machines on this page\`}</p>;
}`,
    query: "page=1&size=5",
    render: `<DataViews provider={provider}>
  <MachineCount />
  <DataViews.DataTable columns={columns} label="Machines" />
</DataViews>`,
  }),
  render: function Render() {
    const provider = useMachineProvider({ query: "page=1&size=5" });
    return (
      <Component provider={provider}>
        <MachineCount />
        <Component.DataTable columns={columns} label="Machines" />
      </Component>
    );
  },
  play: async ({ canvas }) => {
    const table = await canvas.findByRole("table", { name: "Machines" });
    await waitFor(() =>
      expect(
        within(table)
          .getAllByRole("row")
          .filter((row) => within(row).queryAllByRole("cell").length > 0),
      ).toHaveLength(5),
    );
    await expect(
      canvas.getByText("5 machines on this page"),
    ).toBeInTheDocument();
  },
};
