import type { Meta, StoryObj } from "@storybook/react-vite";
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
  MachineFields,
  MachineProviderConfig,
} from "../../../../../../storybook/machines/index.js";
import {
  createEmptySource,
  createFailingSource,
  createPendingSource,
  machineCollection,
  readHostName,
  readPaginationSummary,
  showConsumerCode,
  useMachineProvider,
} from "../../../../../../storybook/machines/index.js";
import { createRestMachineSource } from "../../../../../../storybook/machines/sources/index.js";
import pickStoryWords from "../../../../../../storybook/pickStoryWords.js";
import type { StoryWords } from "../../../../../../storybook/types.js";
import type {
  DisplayField,
  DisplayFieldCellProps,
} from "../../../../../common/index.js";
import { RendererSwitch } from "../../../../../common/RendererSwitch/index.js";
import { DataViews } from "../../../index.js";
import { createColumns } from "../DataTable/index.js";
import Component from "./DataCards.js";
import { ConnectedDataCards as ConnectedCards } from "./index.js";
import type { DataCardsProps } from "./types.js";

const meta = {
  title: "patterns/DataViews/Renderers/DataCards",
  tags: ["experimental"],
  component: Component,
  decorators: [withAppScope],
  args: {
    label: "Machines",
    title: "name",
  },
  // Each story supplies its own provider, fields and callbacks: they stay in
  // the API reference, but none of them is a value a control can edit.
  argTypes: {
    provider: { control: false },
    fields: { control: false },
    getRowLabel: { control: false },
    renderStatus: { control: false },
  },
  // The REST-backed story's endpoint, served through the Storybook MSW
  // addon before a story first renders. Every story here carries it, so a
  // docs page that renders them all together never clears it.
  parameters: { msw: { handlers: createRestHandlers({ latency: 300 }) } },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/** The cards' own props, less the ones a story's collection supplies. */
type StoryCardsProps = Omit<
  DataCardsProps<MachineFields, Machine>,
  "provider" | "fields" | "getRowLabel"
>;

const fields = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "region", header: "Region" },
    { field: "cores", header: "Cores" },
    { field: "owner", header: "Owner" },
  ],
});

const fieldsCode = `const fields = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "region", header: "Region" },
    { field: "cores", header: "Cores" },
    { field: "owner", header: "Owner" },
  ],
});`;

/** The import every story's code shows for a part not yet on the root. */
const spikeImports = `import { machineCollection, machines } from "./machines.js";
// A work-in-progress spike: not yet exported from the package root.
import { DataCards } from "./DataCards.js";`;

/** The cards over a provider bound to the story's own source. */
function MachineCards({
  cardFields = fields,
  options,
  ...args
}: StoryCardsProps & {
  readonly cardFields?: readonly DisplayField<Machine>[] | undefined;
  readonly options?: MachineProviderConfig | undefined;
}): ReactElement {
  const provider = useMachineProvider(options);
  return (
    <Component
      {...args}
      provider={provider}
      fields={cardFields}
      getRowLabel={readHostName}
    />
  );
}

/**
 * Default: one card per machine, headed and named by its host, with the
 * other fields listed beneath it. The cards are the design system's own, laid
 * out by its Cards group; they are a list, read in order.
 */
export const Default: Story = {
  render: (args) => <MachineCards {...args} />,
  parameters: showConsumerCode({
    parts: ["createColumns"],
    imports: spikeImports,
    declarations: fieldsCode,
    render: `<DataCards provider={provider} fields={fields} title="name" label="Machines" />`,
  }),
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("listitem", { name: "alder.example.com" }),
    ).toBeVisible();
  },
};

/**
 * Selectable: each card carries a checkbox named for its host, and one above
 * the cards selects every card on the page, or clears them.
 */
export const Selectable: Story = {
  args: { selectable: true },
  render: (args) => <MachineCards {...args} />,
  parameters: showConsumerCode({
    parts: ["createColumns"],
    imports: `import { type Machine, machineCollection, machines } from "./machines.js";
// A work-in-progress spike: not yet exported from the package root.
import { DataCards } from "./DataCards.js";`,
    declarations: `${fieldsCode}

const nameMachine = (machine: Machine) => machine.name;`,
    render: `<DataCards
  provider={provider}
  fields={fields}
  title="name"
  label="Machines"
  selectable
  getRowLabel={nameMachine}
/>`,
  }),
  play: async ({ canvas }) => {
    const alder = await canvas.findByRole("checkbox", {
      name: "Select alder.example.com",
    });
    await userEvent.click(alder);
    await expect(alder).toBeChecked();
    const all = canvas.getByRole<HTMLInputElement>("checkbox", {
      name: "Select all displayed rows",
    });
    await waitFor(() => expect(all.indeterminate).toBe(true));
  },
};

/** A status field drawn by its own cell, handed its typed record. */
function StatusCell({
  value,
  record,
}: DisplayFieldCellProps<Machine["status"], Machine>): ReactElement {
  return <span title={record.note}>{value.toUpperCase()}</span>;
}

const customFields = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status", cell: StatusCell },
    { field: "cores", header: "Cores" },
  ],
});

/**
 * A field's own cell: the status is drawn by a cell of its own, handed its
 * typed value and record, as a table hands them, so one cell works in a
 * table and on a card.
 */
export const CustomCell: Story = {
  name: "Custom cell",
  render: (args) => <MachineCards {...args} cardFields={customFields} />,
  parameters: showConsumerCode({
    parts: ["createColumns", "type DisplayFieldCellProps"],
    imports: spikeImports.replace(
      "{ machineCollection",
      "{ type Machine, machineCollection",
    ),
    declarations: `function StatusCell({
  value,
  record,
}: DisplayFieldCellProps<Machine["status"], Machine>) {
  return <span title={record.note}>{value.toUpperCase()}</span>;
}

const fields = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status", cell: StatusCell },
    { field: "cores", header: "Cores" },
  ],
});`,
    render: `<DataCards provider={provider} fields={fields} title="name" label="Machines" />`,
  }),
  play: async ({ canvas }) => {
    const birch = await canvas.findByRole("listitem", {
      name: "birch.example.com",
    });
    await expect(within(birch).getByText("FAILED")).toBeVisible();
  },
};

/** Loading: the source has not answered, so the cards say so and draw none. */
export const Loading: Story = {
  render: (args) => (
    <MachineCards {...args} options={{ source: createPendingSource }} />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Loading…")).toBeVisible();
  },
};

/** Failed: the request failed, and the cards say why, politely. */
export const Failed: Story = {
  render: (args) => (
    <MachineCards {...args} options={{ source: createFailingSource }} />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "the machine inventory could not be reached",
    );
  },
};

/** No data: the collection is empty, which the cards say rather than draw nothing. */
export const NoData: Story = {
  name: "No data",
  render: (args) => (
    <MachineCards {...args} options={{ source: createEmptySource }} />
  ),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "There is nothing here yet.",
    );
  },
};

/** DataCards in a root, beside the sort panel and the pagination bar. */
function SortedAndPagedMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  return (
    <>
      <DataViews.SortPanel />
      <ConnectedCards
        fields={fields}
        title="name"
        label={label}
        selectable
        getRowLabel={(row) => row.name}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </>
  );
}

/**
 * Sorted and paged: the cards show nothing of the ordering or the paging
 * themselves. The sort panel orders them and the pagination bar pages them,
 * both placed beside the cards in one root.
 */
export const SortedAndPaged: Story = {
  name: "Sorted and paged",
  decorators: [withMachineRoot({ query: "page=1&size=5" })],
  render: ({ label }) => <SortedAndPagedMachines label={label} />,
  parameters: showConsumerCode({
    parts: ["DataViews", "createColumns"],
    imports: `import { machineCollection, machines } from "./machines.js";
// A work-in-progress spike: not yet exported from the package root.
import { DataCards } from "./DataViews/DataCards.js";`,
    query: "page=1&size=5",
    declarations: fieldsCode,
    render: `<DataViews provider={provider}>
  <DataViews.SortPanel />
  <DataCards fields={fields} title="name" label="Machines" selectable />
  <DataViews.Pagination sizes={[5, 10]} />
</DataViews>`,
  }),
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(readPaginationSummary(canvas)).toHaveTextContent(
        "Showing 1–5 out of 12 rows",
      ),
    );
    await expect(canvas.getAllByRole("listitem")).toHaveLength(5);
  },
};

/**
 * A table and cards over one root, through the renderer switch, which is its
 * own root and so takes the story's words itself.
 */
function TableOrCardsMachines({
  label,
  ...words
}: StoryWords & {
  readonly label: string;
}): ReactElement {
  return (
    <>
      <RendererSwitch
        {...words}
        label="Show machines as"
        renderers={[
          {
            id: "table",
            label: "Table",
            content: (
              <DataViews.DataTable
                columns={fields}
                label={label}
                selectable
                getRowLabel={(row) => row.name}
              />
            ),
          },
          {
            id: "cards",
            label: "Cards",
            content: (
              <ConnectedCards
                fields={fields}
                title="name"
                label={label}
                selectable
                getRowLabel={(row) => row.name}
              />
            ),
          },
        ]}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </>
  );
}

/**
 * Table or cards: one query, one page and one selection, shown as a table or
 * as cards. A machine selected in the table is selected on its card, and the
 * page stays where it was. Without scripting the table, the default, is
 * drawn alone.
 */
export const TableOrCards: Story = {
  name: "Table or cards",
  decorators: [withMachineRoot({ query: "page=1&size=5" })],
  render: ({ label, messages }) => (
    <TableOrCardsMachines label={label} {...pickStoryWords({ messages })} />
  ),
  parameters: showConsumerCode({
    parts: ["DataViews", "createColumns"],
    imports: `import { machineCollection, machines } from "./machines.js";
// Internal to the package and not exported: shown for their shape.
import { DataCards } from "./DataViews/DataCards.js";
import { RendererSwitch } from "./RendererSwitch.js";`,
    query: "page=1&size=5",
    declarations: fieldsCode,
    render: `<DataViews provider={provider}>
  <RendererSwitch
    label="Show machines as"
    renderers={[
      {
        id: "table",
        label: "Table",
        content: <DataViews.DataTable columns={fields} label="Machines" selectable />,
      },
      {
        id: "cards",
        label: "Cards",
        content: <DataCards fields={fields} title="name" label="Machines" selectable />,
      },
    ]}
  />
  <DataViews.Pagination sizes={[5, 10]} />
</DataViews>`,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: "Select alder.example.com" }),
    );
    const choice = canvas.getByRole("group", { name: "Show machines as" });
    await userEvent.click(
      within(choice).getByRole("button", { name: "Cards" }),
    );
    await expect(
      within(choice).getByRole("button", { name: "Cards" }),
    ).toHaveAttribute("aria-pressed", "true");
    const card = await canvas.findByRole("listitem", {
      name: "alder.example.com",
    });
    await expect(
      within(card).getByRole("checkbox", { name: "Select alder.example.com" }),
    ).toBeChecked();
  },
};

/** DataCards over the REST endpoint, with the pagination bar reaching it too. */
function RestBackedMachines({
  label,
}: {
  readonly label: string;
}): ReactElement {
  return (
    <>
      <ConnectedCards
        fields={fields}
        title="name"
        label={label}
        getRowLabel={(row) => row.name}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </>
  );
}

/**
 * REST-backed: the same cards over a REST endpoint reached through TanStack
 * Query. The endpoint pages and counts; the cards draw the page it answers,
 * and say they are loading until it does.
 */
export const RestBacked: Story = {
  name: "REST backed",
  decorators: [
    withMachineRoot({
      source: () => createRestMachineSource("live"),
      query: "page=1&size=5",
    }),
  ],
  render: ({ label }) => <RestBackedMachines label={label} />,
  play: async ({ canvas }) => {
    await answerBehind("rest");
    await waitFor(() =>
      expect(readPaginationSummary(canvas)).toHaveTextContent(
        "Showing 1–5 out of 12 rows",
      ),
    );
    await expect(canvas.getAllByRole("listitem")).toHaveLength(5);
  },
};
