import type { DataViewsMessages } from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { expect, within } from "storybook/test";
import {
  createColumns,
  DataTable,
} from "../lib/pattern/DataViews/common/renderers/DataTable/index.js";
import Component from "../lib/pattern/DataViews/Provider.js";
import { PaginationBar } from "../lib/subcomponent/PaginationBar/index.js";
import { withAppScope } from "../storybook/decorators/index.js";
import fr from "../storybook/locales/fr.js";
import {
  machineCollection,
  readHostName,
  useMachineProvider,
} from "../storybook/machines/index.js";

const meta = {
  title: "Documentation/Messages and internationalization",
  component: Component,
  decorators: [withAppScope],
  // The page on messages is this entry's documentation.
  tags: ["!autodocs", "experimental"],
  argTypes: {
    provider: { control: false },
    messages: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * A few messages reworded for a product, at module scope so their identity
 * stays the same. The rest stay English.
 */
const OWN_WORDS: Partial<DataViewsMessages> = {
  search: "Find a machine",
  statusNoResults: "No machine matches this search.",
  pageCount: (pages) => `of ${pages} ${pages === 1 ? "screen" : "screens"}`,
};

const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host", sortable: true },
    { field: "status", header: "Status" },
    { field: "cores", header: "Cores" },
  ],
});

/** The same columns, headed in French: headings are the application's data. */
const frenchColumns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Hôte", sortable: true },
    { field: "status", header: "État" },
    { field: "cores", header: "Cœurs" },
  ],
});

/** A partial set: three messages reworded, every other one in English. */
export const PartialOverride: Story = {
  name: "Partial override",
  render: function RenderPartialOverride(): ReactElement {
    const provider = useMachineProvider({ query: "q=nothing&page=1&size=5" });
    return (
      <Component provider={provider} messages={OWN_WORDS}>
        <Component.Search />
        <Component.DataTable
          columns={columns}
          label="Machines"
          footer={<Component.Pagination sizes={[5, 10]} />}
        />
      </Component>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("No machine matches this search."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("searchbox", { name: "Find a machine" }),
    ).toBeInTheDocument();
  },
};

/**
 * A whole French record. The region is marked `lang="fr"`, the field labels
 * and the column headings are the application's own French, and every word
 * the parts say comes from the record.
 */
export const FrenchLocale: Story = {
  name: "French locale",
  render: function RenderFrenchLocale(): ReactElement {
    const provider = useMachineProvider({ query: "page=1&size=5" });
    return (
      <div lang="fr">
        <Component provider={provider} messages={fr}>
          <Component.Search />
          <Component.Filters labels={{ status: "État", cores: "Cœurs" }} />
          <Component.DataTable
            columns={frenchColumns}
            label="Machines"
            selectable
            getRowLabel={readHostName}
            footer={<Component.Pagination sizes={[5, 10]} />}
          />
          <Component.ActionBar />
        </Component>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("searchbox", { name: "Rechercher" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("checkbox", {
        name: "Sélectionner toutes les lignes affichées",
      }),
    ).toBeInTheDocument();
  },
};

/** Standalone parts are their own root, so each takes `messages` itself. */
export const StandaloneParts: Story = {
  name: "Standalone parts",
  render: function RenderStandaloneParts(): ReactElement {
    const provider = useMachineProvider({ query: "page=1&size=5" });
    return (
      <div lang="fr">
        <DataTable
          provider={provider}
          columns={frenchColumns}
          label="Machines"
          messages={fr}
          footer={
            <PaginationBar provider={provider} sizes={[5, 10]} messages={fr} />
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Page suivante" }),
    ).toBeInTheDocument();
  },
};
