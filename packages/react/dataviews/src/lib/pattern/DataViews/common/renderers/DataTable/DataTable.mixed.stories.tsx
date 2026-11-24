import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { expect } from "storybook/test";
import { withAppScope } from "../../../../../../storybook/decorators/index.js";
import {
  storyWorkloads,
  workloadCollection,
} from "../../../../../../storybook/workloads/index.js";
import Component from "./DataTable.js";
import { createColumns } from "./index.js";

const meta = {
  title: "patterns/DataViews/Renderers/DataTable/Mixed records",
  component: Component,
  tags: ["experimental"],
  decorators: [withAppScope],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The instance columns: one over a nested field, one narrowing on the
 * record's type.
 */
const columns = createColumns({
  collection: workloadCollection,
  columns: [
    { field: "name", header: "Name" },
    { field: "type", header: "Type" },
    { field: "image", header: "Image" },
    { field: "cores", header: "Cores" },
    { field: "host.region", header: "Region" },
    {
      id: "runs",
      header: "Runs",
      cell: ({ record }) =>
        record.type === "container"
          ? `from ${record.image}`
          : `on ${record.cores} cores`,
    },
  ],
});

/** The instances over a local source, built once. */
function Instances(): ReactElement {
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: workloadCollection,
      source: createArraySource({
        rows: storyWorkloads,
        collection: workloadCollection,
      }),
    }),
  );
  return (
    <Component
      provider={provider}
      columns={columns}
      label="Instances"
      selectable
      getRowLabel={(workload) => `${workload.name} (${workload.type})`}
    />
  );
}

/**
 * Records of several types: containers and virtual machines in one table.
 * Image applies to containers and Cores to virtual machines, so each draws a
 * dash, read as "Not applicable", where it does not apply, and each heading
 * is described by the types it applies to. Region reads a nested field by
 * its dot path. The Runs cell narrows on the record's type and reads the
 * field that type carries.
 */
export const MixedRecords: Story = {
  args: { label: "Instances" },
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { createColumns, DataTable } from "@canonical/dataviews-react";
import { useState } from "react";
import { type Workload, workloads } from "./workloads.js";

const workloadCollection = createCollection({
  identify: (workload: Workload) => workload.id,
  fields: [
    { field: "name", kind: "text" },
    { field: "type", kind: "choices", options: ["container", "vm"] },
    { field: "image", kind: "text", appliesTo: ["container"] },
    { field: "cores", kind: "number", min: 1, appliesTo: ["vm"] },
    { field: "host.region", kind: "text" },
  ],
  discriminator: "type",
});

const columns = createColumns({
  collection: workloadCollection,
  columns: [
    { field: "name", header: "Name" },
    { field: "type", header: "Type" },
    { field: "image", header: "Image" },
    { field: "cores", header: "Cores" },
    { field: "host.region", header: "Region" },
    {
      id: "runs",
      header: "Runs",
      cell: ({ record }) =>
        record.type === "container"
          ? \`from \${record.image}\`
          : \`on \${record.cores} cores\`,
    },
  ],
});

export function Instances() {
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: workloadCollection,
      source: createArraySource({
        rows: workloads,
        collection: workloadCollection,
      }),
    }),
  );
  return (
    <DataTable
      provider={provider}
      columns={columns}
      label="Instances"
      selectable
      getRowLabel={(workload) => \`\${workload.name} (\${workload.type})\`}
    />
  );
}`,
      },
    },
  },
  render: () => <Instances />,
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("checkbox", { name: "Select db (vm)" }),
    ).toBeVisible();
    await expect(canvas.getByText("from ubuntu/24.04")).toBeVisible();
    await expect(canvas.getByText("on 8 cores")).toBeVisible();
    await expect(canvas.getAllByRole("cell", { name: "eu-west" })).toHaveLength(
      3,
    );
    await expect(
      canvas.getAllByRole("cell", { name: "Not applicable" }),
    ).toHaveLength(6);
    await expect(
      canvas.getByRole("columnheader", { name: "Cores" }),
    ).toHaveAccessibleDescription("Applies to vm");
  },
};
