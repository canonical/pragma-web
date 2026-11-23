import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../../../storybook/decorators/index.js";
import showConsumerCode from "../../../../../storybook/machines/showConsumerCode.js";
import type { MachineProvider } from "../../../../../storybook/machines/types.js";
import useMachineProvider from "../../../../../storybook/machines/useMachineProvider.js";
import pickStoryWords from "../../../../../storybook/pickStoryWords.js";
import type { StoryWords } from "../../../../../storybook/types.js";
import type { DataTableColumn } from "../../../DataTable/index.js";
import DataViews from "../../Provider.js";
import Component from "./Settings.js";

/** The part's props, and the words the story's root speaks. */
type StoryArgs = ComponentProps<typeof Component> & StoryWords;

const meta = {
  title: "_work_in_progress/DataViews/Settings",
  component: Component,
  decorators: [withAppScope],
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host", hideable: false, sortable: true },
  { id: "status", header: "Status", sortable: true },
  { id: "cores", header: "Cores", sortable: true },
  { id: "owner", header: "Owner" },
];

const columnsCode = `const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host", hideable: false, sortable: true },
  { id: "status", header: "Status", sortable: true },
  { id: "cores", header: "Cores", sortable: true },
  { id: "owner", header: "Owner" },
];`;

const renderCode = `<DataViews provider={provider}>
  <DataViews.DataTable columns={columns} label="Machines" settings={<DataViews.Settings />} />
</DataViews>`;

/**
 * Hide the owner and put the status first before the story renders.
 *
 * @note Impure: changes the provider's presentation.
 */
const arrangeForTheViewer = (provider: MachineProvider): void => {
  provider.presentation.arrange({
    "table.order": ["status", "name", "cores", "owner"],
    "table.hidden": ["owner"],
  });
};

/** The table with its settings, over one root speaking `messages` when given. */
function Collection({
  prepare,
  ...words
}: StoryWords & {
  readonly prepare?: (provider: MachineProvider) => void;
}): ReactElement {
  const provider = useMachineProvider({ prepare });
  return (
    <DataViews provider={provider} {...words}>
      <DataViews.DataTable
        columns={columns}
        label="Machines"
        settings={<Component />}
      />
    </DataViews>
  );
}

/**
 * Default: the settings button ends the table's header. Its menu lists every
 * column with a toggle named for it, Move left and Move right, then Reset
 * table settings. Host is declared `hideable: false`, so its menu says it is
 * always shown; the last column shown can never be hidden.
 */
export const Default: Story = {
  parameters: showConsumerCode({
    parts: ["DataViews", "type DataTableColumn"],
    declarations: columnsCode,
    render: renderCode,
  }),
  render: (args) => <Collection {...pickStoryWords(args)} />,
};

/**
 * Hide a column: choosing Hide Owner takes the column out of every table on
 * the provider, says so politely, and returns focus to the settings button.
 * Nothing is asked of the source: the rows are the same rows.
 */
export const HideAColumn: Story = {
  parameters: showConsumerCode({
    parts: ["DataViews", "type DataTableColumn"],
    declarations: columnsCode,
    render: renderCode,
  }),
  render: (args) => <Collection {...pickStoryWords(args)} />,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Table settings" });
    await userEvent.click(trigger);
    await userEvent.click(
      await within(document.body).findByRole("menuitem", {
        name: "Hide Owner",
      }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole("columnheader", { name: "Owner" }),
      ).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole("button", { name: "Table settings" }),
    ).toHaveFocus();
  },
};

/**
 * Arranged by the viewer: the status moved first and the owner hidden. The
 * menu lists the columns in that order, the owner with Show in place of
 * Hide; Reset table settings returns the declared arrangement.
 */
export const ArrangedByTheViewer: Story = {
  parameters: showConsumerCode({
    parts: ["DataViews", "type DataTableColumn"],
    declarations: columnsCode,
    prepare: `provider.presentation.arrange({
  "table.order": ["status", "name", "cores", "owner"],
  "table.hidden": ["owner"],
});`,
    render: renderCode,
  }),
  render: (args) => (
    <Collection {...pickStoryWords(args)} prepare={arrangeForTheViewer} />
  ),
};
