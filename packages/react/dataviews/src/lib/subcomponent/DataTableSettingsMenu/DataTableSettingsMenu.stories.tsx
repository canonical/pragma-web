import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactElement } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../storybook/decorators/index.js";
import {
  type MachineProvider,
  machineCollection,
  showConsumerCode,
  useMachineProvider,
} from "../../../storybook/machines/index.js";
import pickStoryWords from "../../../storybook/pickStoryWords.js";
import type { StoryWords } from "../../../storybook/types.js";
import { createColumns } from "../../pattern/DataViews/common/renderers/DataTable/index.js";
import { DataViews } from "../../pattern/DataViews/index.js";
import Component from "./DataTableSettingsMenu.js";

/** The part's props, and the words the story's root speaks. */
type StoryArgs = ComponentProps<typeof Component> & StoryWords;

const meta = {
  title: "subcomponents/DataTableSettingsMenu",
  component: Component,
  tags: ["experimental"],
  decorators: [withAppScope],
  // The menu is a top-layer popover, so docs preview each story in its own
  // frame, tall enough for the open menu.
  parameters: { docs: { story: { inline: false, iframeHeight: "440px" } } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host", hideable: false, sortable: true },
    { field: "status", header: "Status", sortable: true },
    { field: "cores", header: "Cores", sortable: true },
    { field: "owner", header: "Owner" },
  ],
});

const columnsCode = `const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host", hideable: false, sortable: true },
    { field: "status", header: "Status", sortable: true },
    { field: "cores", header: "Cores", sortable: true },
    { field: "owner", header: "Owner" },
  ],
});`;

const renderCode = `<DataViews provider={provider}>
  <DataViews.DataTable
    id="machines"
    columns={columns}
    label="Machines"
    settings={<DataTable.SettingsMenu />}
  />
</DataViews>`;

/** Close the open settings menu from its button, leaving the story at rest. */
const closeMenu = async (canvas: ReturnType<typeof within>): Promise<void> => {
  const trigger = canvas.getByRole("button", { name: "Table settings" });
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(trigger).toHaveAttribute("aria-expanded", "false"),
  );
};

/**
 * Hide the owner and put the status first before the story renders.
 *
 * @note Impure: changes the provider's presentation.
 */
const arrangeForTheViewer = (provider: MachineProvider): void => {
  provider.presentation.arrange({
    "table.machines.order": ["status", "name", "cores", "owner"],
    "table.machines.hidden": ["owner"],
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
        id="machines"
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
    parts: ["DataTable", "DataViews", "createColumns"],
    declarations: columnsCode,
    render: renderCode,
  }),
  render: (args) => <Collection {...pickStoryWords(args)} />,
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Table settings" }),
    );
    await expect(
      await within(document.body).findByRole("menuitem", {
        name: "Host is always shown",
      }),
    ).toBeInTheDocument();
    await closeMenu(canvas);
  },
};

/**
 * Without a location: no change leads anywhere before scripts run, so the
 * button is drawn disabled and hidden until scripting can drive it. Here
 * scripts run, so it shows, enabled, and opens the menu.
 */
export const WithoutALocation: Story = {
  parameters: showConsumerCode({
    parts: ["DataTable", "DataViews", "type DataTableColumn"],
    declarations: columnsCode,
    render: renderCode,
  }),
  render: (args) => <Collection {...pickStoryWords(args)} />,
  play: async ({ canvas }) => {
    const trigger = await canvas.findByRole("button", {
      name: "Table settings",
    });
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeEnabled();
  },
};

/**
 * Hide a column: choosing Hide Owner takes the column out of this table,
 * says so, and returns focus to the settings button.
 */
export const HideAColumn: Story = {
  name: "Hide a column",
  parameters: showConsumerCode({
    parts: ["DataTable", "DataViews", "createColumns"],
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
  name: "Arranged by the viewer",
  parameters: showConsumerCode({
    parts: ["DataTable", "DataViews", "createColumns"],
    declarations: columnsCode,
    prepare: `provider.presentation.arrange({
  "table.machines.order": ["status", "name", "cores", "owner"],
  "table.machines.hidden": ["owner"],
});`,
    render: renderCode,
  }),
  render: (args) => (
    <Collection {...pickStoryWords(args)} prepare={arrangeForTheViewer} />
  ),
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole("button", { name: "Table settings" }),
    );
    const menu = await within(document.body).findByRole("menu", {
      name: "Table settings",
    });
    await expect(
      within(menu).getAllByRole("menuitem").at(0),
    ).toHaveAccessibleName("Hide Status");
    await expect(
      within(menu).getByRole("menuitem", { name: "Show Owner" }),
    ).toBeInTheDocument();
    await closeMenu(canvas);
  },
};
