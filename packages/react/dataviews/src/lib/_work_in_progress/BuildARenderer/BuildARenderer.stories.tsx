import type { Source, SourceRefusal } from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, userEvent, within } from "storybook/test";
import { withAppScope } from "../../../storybook/decorators.js";
import {
  createEmptySource,
  createFailingSource,
  createMachineSource,
  createPendingSource,
  type Machine,
  machineCollection,
} from "../../../storybook/machines/fixtures.js";
import { useMachineProvider } from "../../../storybook/machines/story-utils.js";
import type { DataTableColumn } from "../DataTable/index.js";
import { DataViews } from "../DataViews/index.js";
import { ConnectedRecordList, PlainList, StatusList } from "./common/index.js";
import Component from "./common/RecordList/RecordList.js";

const meta = {
  title: "_work_in_progress/DataViews/Renderers/Build your own renderer",
  component: Component,
  decorators: [withAppScope],
  // The tutorial page is this folder's documentation.
  tags: ["!autodocs"],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/** A machine, as the tutorial's lists name it. */
const nameMachine = (machine: Machine): string => machine.name;

/** A source that refuses every ordering while its index rebuilds. */
const createRebuildingSource = (): Source<Machine> => {
  const refusal: SourceRefusal = {
    part: "sort",
    code: "unsupported-combination",
    field: "name",
    operator: null,
    reason: "the index is rebuilding",
  };
  return {
    ...createMachineSource(),
    refusals: (query) => (query.slice.sort.length > 0 ? [refusal] : []),
  };
};

function PlainMachines(): ReactElement {
  const provider = useMachineProvider({ query: "page=1&size=5" });
  return (
    <PlainList provider={provider} label="Machines" nameRecord={nameMachine} />
  );
}

/** Step 1: one list item per row on the page, and nothing else. */
export const APlainList: Story = {
  render: () => <PlainMachines />,
};

function StatusMachines({
  source,
  query = "page=1&size=5",
}: {
  readonly source: () => Source<Machine>;
  readonly query?: string;
}): ReactElement {
  const provider = useMachineProvider({ source, query });
  return (
    <StatusList provider={provider} label="Machines" nameRecord={nameMachine} />
  );
}

/** Step 2: the source has not answered yet, so the list says it is loading. */
export const StatusLoading: Story = {
  render: () => <StatusMachines source={createPendingSource} />,
};

/** Step 2: the source failed, and its reason stands in place of the rows. */
export const StatusFailed: Story = {
  render: () => <StatusMachines source={createFailingSource} />,
};

/** Step 2: the collection holds nothing yet. */
export const StatusNoData: Story = {
  render: () => <StatusMachines source={createEmptySource} />,
};

/** Step 2: the search matches no machine. */
export const StatusNoMatch: Story = {
  render: () => (
    <StatusMachines
      source={createMachineSource}
      query="q=nothing-matches&page=1&size=5"
    />
  ),
};

function SelectableMachines({
  source = createMachineSource,
}: {
  readonly source?: () => Source<Machine>;
}): ReactElement {
  const provider = useMachineProvider({ source, query: "page=1&size=5" });
  return (
    <Component
      provider={provider}
      label="Machines"
      nameRecord={nameMachine}
      selectable
      sortBy={{ field: "name", label: "Sort by host" }}
    />
  );
}

/** Step 3: a checkbox per record, and a sort the source can run. */
export const SelectionAndSort: Story = {
  render: () => <SelectableMachines />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Sort descending" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Sort descending" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

/** Step 3: the source refuses the sort, and the list says why. */
export const SortRefused: Story = {
  render: () => <SelectableMachines source={createRebuildingSource} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Sort ascending" }),
    );
    await expect(
      within(canvas.getByRole("group", { name: "Sort by host" })).getByRole(
        "status",
      ),
    ).toHaveTextContent("Sort unchanged: the index is rebuilding.");
  },
};

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
];

function ConnectedMachines(): ReactElement {
  const provider = useMachineProvider({ query: "page=1&size=5" });
  return (
    <DataViews provider={provider}>
      <DataViews.Search label="Search machines" />
      <ConnectedRecordList
        collection={machineCollection}
        label="Machines"
        nameRecord={nameMachine}
        selectable
      />
      <DataViews.DataTable
        columns={columns}
        label="Machine table"
        selectable
        rowLabel={(row) => String(row["name"])}
      />
      <DataViews.Pagination sizes={[5, 10]} />
    </DataViews>
  );
}

/**
 * Step 4: the connected twin inside a root, beside the root's table. The
 * search and the pagination move both, and a record selected in one is
 * selected in the other.
 */
export const ConnectedTwin: Story = {
  render: () => <ConnectedMachines />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = within(canvas.getByRole("region", { name: "Machines" }));
    const [first] = list.getAllByRole("checkbox");
    if (first === undefined) {
      throw new Error("the list drew no checkbox");
    }
    await userEvent.click(first);
    const table = within(canvas.getByRole("table", { name: "Machine table" }));
    await expect(
      table.getByRole("checkbox", {
        name: first.getAttribute("aria-label") ?? "",
      }),
    ).toBeChecked();
  },
};
