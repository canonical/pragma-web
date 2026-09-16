import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { consumerCode } from "../../../storybook/consumerCode.js";
import { withAppScope } from "../../../storybook/decorators.js";
import {
  createUndeclaredTypeSource,
  type Instance,
  type InstanceFields,
  instanceCollection,
} from "../../../storybook/instances/fixtures.js";
import {
  type InstanceProviderConfig,
  useInstanceProvider,
} from "../../../storybook/instances/story-utils.js";
import { useDataViewsCell, useDataViewsValue } from "../../hooks/index.js";
import { DataViews } from "../DataViews/index.js";
import createColumns from "./createColumns.js";
import Component from "./DataTable.js";
import type { DataTableColumn, DataTableProps } from "./types.js";

const meta = {
  title: "_work_in_progress/DataTable/Polymorphic",
  component: Component,
  decorators: [withAppScope],
  args: {
    label: "Instances",
  },
  argTypes: {
    provider: { control: false },
    columns: { control: false },
    rowLabel: { control: false },
    renderStatus: { control: false },
    virtualization: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/** The table's own props, less the ones a story's collection supplies. */
type StoryTableProps = Omit<
  DataTableProps<InstanceFields, Instance>,
  "provider" | "columns"
>;

/** The table over a provider bound to the story's own source. */
function InstancesTable({
  columns,
  options,
  ...args
}: StoryTableProps & {
  readonly columns: readonly DataTableColumn[];
  readonly options?: InstanceProviderConfig | undefined;
}): ReactElement {
  const provider = useInstanceProvider(options);
  return <Component {...args} provider={provider} columns={columns} />;
}

const renderInstances =
  (
    columns: readonly DataTableColumn[],
    options?: InstanceProviderConfig,
  ): NonNullable<Story["render"]> =>
  (args) => <InstancesTable {...args} columns={columns} options={options} />;

/**
 * What an instance runs from, drawn from fields two types carry differently.
 * It reads more of the record than its column's field, so it subscribes to
 * the record through the cell scope rather than reading the record it was
 * handed, and narrows on the type; the compiler holds the arms exhaustive.
 */
function RunsFrom(): ReactElement {
  const cell = useDataViewsCell(instanceCollection);
  const record = useDataViewsValue(cell.record);
  switch (record.type) {
    case "container":
      return <>{record.image === "" ? "no image" : `image ${record.image}`}</>;
    case "virtual-machine":
      return <>{`${record.firmware.toUpperCase()} firmware`}</>;
    default:
      return record satisfies never;
  }
}

/**
 * The columns, declared over the collection: every field name is checked,
 * and a column's own content is handed its record at the record's own type.
 * The `image` and `firmware` columns each apply to one type, which their
 * headings say to a reader.
 */
const columns = createColumns(instanceCollection, [
  { field: "name", header: "Instance", rowHeader: true, sortable: true },
  { field: "type", header: "Type", sortable: true },
  { field: "status", header: "Status", sortable: true },
  { field: "project", header: "Project", sortable: true },
  { field: "image", header: "Image", sortable: true },
  { field: "firmware", header: "Firmware", sortable: true },
  { id: "kind", field: "type", header: "Runs from", cell: RunsFrom },
]);

const collectionCode = `// The collection declares its record types on one \`choices\` field, and
// scopes a field to the types that carry it.
export const instanceCollection = createCollection({
  identify: (instance: Instance) => instance.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "type", kind: "choices", options: ["container", "virtual-machine"] },
    { field: "status", kind: "choices", options: ["running", "stopped", "frozen"] },
    { field: "project", kind: "text" },
    { field: "image", kind: "text", appliesTo: ["container"] },
    { field: "firmware", kind: "choices", options: ["bios", "uefi"], appliesTo: ["virtual-machine"] },
  ],
  discriminator: "type",
});`;

const columnsCode = `// Content reading more of the record than its column's field subscribes to
// the record through the cell scope, and narrows on the discriminator to read
// a type's own field; the compiler holds the arms exhaustive.
function RunsFrom() {
  const cell = useDataViewsCell(instanceCollection);
  const record = useDataViewsValue(cell.record);
  switch (record.type) {
    case "container":
      return record.image === "" ? "no image" : \`image \${record.image}\`;
    case "virtual-machine":
      return \`\${record.firmware.toUpperCase()} firmware\`;
    default:
      return record satisfies never;
  }
}

// Declared over the collection: a misspelt field does not compile.
const columns = createColumns(instanceCollection, [
  { field: "name", header: "Instance", rowHeader: true, sortable: true },
  { field: "type", header: "Type", sortable: true },
  { field: "status", header: "Status", sortable: true },
  { field: "project", header: "Project", sortable: true },
  { field: "image", header: "Image", sortable: true },
  { field: "firmware", header: "Firmware", sortable: true },
  { id: "kind", field: "type", header: "Runs from", cell: RunsFrom },
]);`;

const instanceSource = `createArraySource({
  rows: instances,
  collection: instanceCollection,
  searchFields: ["name", "project"],
})`;

const instanceImports = `import { type Instance, instances } from "./instances.js";`;

const parts = [
  "DataTable",
  "createColumns",
  "useDataViewsCell",
  "useDataViewsValue",
];

/**
 * Two record types in one table. A virtual machine runs from no image and a
 * container boots no firmware: each cell for a field that does not apply to
 * the row's type draws a dash, and a reader hears "Not applicable" there —
 * told apart from `scratch-01`, whose image is empty and whose cell says
 * nothing. The Image and Firmware headings are each described by the types
 * they apply to, read but not drawn. The "Runs from" column's own content
 * narrows on the record's type, so it reads `image` on a container and
 * `firmware` on a machine, and the compiler holds the two arms exhaustive.
 */
export const MixedTypes: Story = {
  parameters: consumerCode({
    parts,
    core: ["createCollection"],
    imports: instanceImports,
    collection: "instanceCollection",
    declarations: `${collectionCode}\n\n${columnsCode}`,
    source: instanceSource,
    render: `<DataTable provider={provider} columns={columns} label="Instances" selectable />`,
  }),
  args: { selectable: true },
  render: renderInstances(columns),
  play: async ({ canvas }) => {
    const machine = await waitFor(() =>
      canvas.getByRole("row", { name: "db-01" }),
    );
    const cells = within(machine).getAllByRole("cell");
    // Image, the fifth cell after the checkbox and the header.
    await expect(cells.at(4)).toHaveAccessibleName("Not applicable");
    await expect(
      within(canvas.getByRole("row", { name: "scratch-01" }))
        .getAllByRole("cell")
        .at(4),
    ).toHaveTextContent(/^$/);
    await expect(
      canvas.getByRole("columnheader", { name: "Image" }),
    ).toHaveAccessibleDescription("Applies to container");
  },
};

/**
 * A column narrowed to fewer types than its field: `status` applies to every
 * record, but this column applies to virtual machines alone, so a
 * container's cell draws the not-applicable state and the heading names the
 * one type. A column naming a type its field does not apply to, or one the
 * collection does not declare, fails where the table mounts.
 */
export const NarrowedColumn: Story = {
  parameters: consumerCode({
    parts,
    core: ["createCollection"],
    imports: instanceImports,
    collection: "instanceCollection",
    declarations: `${collectionCode}

const columns = createColumns(instanceCollection, [
  { field: "name", header: "Instance", rowHeader: true },
  { field: "type", header: "Type" },
  {
    id: "vm-status",
    field: "status",
    header: "VM status",
    appliesTo: ["virtual-machine"],
  },
]);`,
    source: instanceSource,
    render: `<DataTable provider={provider} columns={columns} label="Instances" />`,
  }),
  render: renderInstances(
    createColumns(instanceCollection, [
      { field: "name", header: "Instance", rowHeader: true },
      { field: "type", header: "Type" },
      {
        id: "vm-status",
        field: "status",
        header: "VM status",
        appliesTo: ["virtual-machine"],
      },
    ]),
  ),
  play: async ({ canvas }) => {
    const container = await waitFor(() =>
      canvas.getByRole("row", { name: "web-01" }),
    );
    await expect(within(container).getAllByRole("cell").at(1)) //
      .toHaveAccessibleName("Not applicable");
    await expect(
      within(canvas.getByRole("row", { name: "db-01" }))
        .getAllByRole("cell")
        .at(1),
    ).toHaveTextContent(/^running$/);
    await expect(
      canvas.getByRole("columnheader", { name: "VM status" }),
    ).toHaveAccessibleDescription("Applies to virtual-machine");
  },
};

/**
 * Ordered by a scoped field. A field that does not apply to a row reads as
 * absent to the ordering, as an empty one does, so ascending by Image lists
 * the containers by image, then every record with no image to order by — the
 * virtual machines, and `scratch-01`, whose image is empty — in the source's
 * own order among themselves. Nothing is added to the query for it: the
 * scoping is the collection's, not a filter.
 */
export const OrderedByScopedField: Story = {
  parameters: consumerCode({
    parts,
    core: ["createCollection"],
    imports: instanceImports,
    collection: "instanceCollection",
    declarations: `${collectionCode}\n\n${columnsCode}`,
    source: instanceSource,
    prepare: `provider.setSort([{ field: "image", direction: "asc" }]);`,
    render: `<DataTable provider={provider} columns={columns} label="Instances" />`,
  }),
  render: renderInstances(columns, {
    prepare: (provider) => {
      provider.setSort([{ field: "image", direction: "asc" }]);
    },
  }),
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(
        canvas.getByRole("columnheader", { name: "Image" }),
      ).toHaveAttribute("aria-sort", "ascending"),
    );
    await waitFor(() =>
      expect(canvas.getAllByRole("rowheader")).toHaveLength(10),
    );
    const names = canvas
      .getAllByRole("rowheader")
      .map((header) => header.textContent);
    // The containers with an image, by image; then every record with no
    // image to order by, in the source's own order: a field that does not
    // apply reads as absent, as the empty image of `scratch-01` does.
    await expect(names).toEqual([
      "cache-01",
      "log-01",
      "proxy-01",
      "web-01",
      "web-02",
      "db-01",
      "build-01",
      "win-01",
      "scratch-01",
      "gpu-01",
    ]);
  },
};

/**
 * A filter on a scoped field, through the root's filters. Restricting by
 * Image restricts to containers by meaning: a virtual machine carries no
 * image for the filter to match, and no type predicate is added to the query
 * for it.
 */
export const FilteredOnScopedField: Story = {
  parameters: consumerCode({
    parts: ["DataViews", "createColumns"],
    core: ["createCollection"],
    imports: instanceImports,
    collection: "instanceCollection",
    declarations: `${collectionCode}\n\n${columnsCode}`,
    source: instanceSource,
    render: `<DataViews provider={provider}>
  <DataViews.Filters
    labels={{ type: "Type", status: "Status", project: "Project", image: "Image", firmware: "Firmware" }}
    primary={["image", "type"]}
  />
  <DataViews.DataTable columns={columns} label="Instances" />
</DataViews>`,
  }),
  render: function Render() {
    const provider = useInstanceProvider();
    return (
      <DataViews provider={provider}>
        <DataViews.Filters
          labels={{
            type: "Type",
            status: "Status",
            project: "Project",
            image: "Image",
            firmware: "Firmware",
          }}
          primary={["image", "type"]}
        />
        <DataViews.DataTable columns={columns} label="Instances" />
      </DataViews>
    );
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getAllByRole("rowheader")).toHaveLength(10),
    );
    await userEvent.type(canvas.getByLabelText("Image contains"), "ubuntu");
    await waitFor(() =>
      expect(
        canvas.getAllByRole("rowheader").map((header) => header.textContent),
      ).toEqual(["web-01", "proxy-01", "web-02"]),
    );
  },
};

/**
 * A page carrying a record of a type the collection does not declare fails
 * visibly rather than drawing it wrong: the table cannot say which fields
 * apply to such a record, so the page is refused and the status names the
 * row and the type. The rows already on screen would stay; here there are
 * none yet.
 */
export const UndeclaredType: Story = {
  parameters: consumerCode({
    parts,
    core: ["createCollection"],
    imports: `${instanceImports}
// A server that added a record type the collection does not declare.
import { instancesWithSandbox } from "./instances.js";`,
    collection: "instanceCollection",
    declarations: `${collectionCode}\n\n${columnsCode}`,
    source: `createArraySource({
  rows: instancesWithSandbox,
  collection: instanceCollection,
  searchFields: ["name", "project"],
})`,
    render: `<DataTable provider={provider} columns={columns} label="Instances" />`,
  }),
  render: renderInstances(columns, { source: createUndeclaredTypeSource }),
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        'These rows could not be loaded: record type "sandbox" of row "i-99" is not declared',
      ),
    );
    await expect(canvas.queryByRole("rowheader")).toBeNull();
  },
};
