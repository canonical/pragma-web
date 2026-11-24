import {
  createMemoryLocation,
  type ViewDraft,
} from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createColumns } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";
import Component from "../../lib/pattern/DataViews/Provider.js";
import { withAppScope } from "../../storybook/decorators/index.js";
import type { MachineProvider } from "../../storybook/machines/index.js";
import {
  machineCollection,
  QueryInTheLocation,
  showConsumerCode,
  useMachineProvider,
  useStoryViewStore,
} from "../../storybook/machines/index.js";
import pickStoryWords from "../../storybook/pickStoryWords.js";
import type { StoryWords } from "../../storybook/types.js";

const meta = {
  title: "Documentation/Guides/Composition",
  tags: ["experimental"],
  component: Component,
  decorators: [withAppScope],
  argTypes: {
    provider: { control: false },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "cores", header: "Cores" },
    { field: "owner", header: "Owner" },
  ],
});

const columnsCode = `const columns = createColumns({
  collection: machineCollection,
  columns: [
    { field: "name", header: "Host" },
    { field: "status", header: "Status" },
    { field: "cores", header: "Cores" },
    { field: "owner", header: "Owner" },
  ],
});`;

/** The namer the connected table reads, declared at module scope. */
const nameMachineCode = `const nameMachine = (machine: Machine) => machine.name;`;

/** The pagination bar's summary: the filters hold status regions of their own. */
const getSummary = (canvas: ReturnType<typeof within>): HTMLElement =>
  within(canvas.getByRole("navigation", { name: "Pagination" })).getByRole(
    "status",
  );

/**
 * The root and its parts over one provider, as an application lays them
 * out, speaking `messages` when given.
 */
function Collection({
  provider,
  children,
  ...words
}: StoryWords & {
  readonly provider: MachineProvider;
  readonly children?: ReactElement | undefined;
}): ReactElement {
  return (
    <Component provider={provider} {...words}>
      {provider.views === null ? null : <Component.SavedViews />}
      <Component.Search label="Search machines" />
      <Component.Filters
        labels={{
          status: "Status",
          cores: "Cores",
          name: "Host",
          region: "Region",
          owner: "Owner",
        }}
      />
      {children}
      <Component.DataTable
        columns={columns}
        label="Machines"
        selectable
        getRowLabel={(row) => row.name}
      />
      <Component.ActionBar />
      <Component.Pagination sizes={[5, 10, 25]} />
    </Component>
  );
}

const selectTwo = (provider: MachineProvider): void => {
  provider.selection.add(["m-02", "m-06"]);
};

/** A saved view the screen's store opens with. */
const failedMachines: ViewDraft = {
  id: "failed-machines",
  name: "Failed machines",
  query: "status=failed",
  presentation: {},
};

/**
 * The whole screen: one provider over a source, a location and a store of
 * saved views, and every part reading it. The views open a query, the
 * filters edit it, the table shows the rows that answer it, the action bar
 * acts on the selection, and the pagination bar pages the window. None of
 * them takes a copy of the query, the window or the selection; the URL and
 * the store follow the provider, which owns both loops.
 */
export const ConnectedParts: Story = {
  name: "Connected parts",
  parameters: showConsumerCode({
    parts: ["DataViews", "createColumns"],
    core: ["createPlatformLocation"],
    imports: `import { type Machine, machineCollection, machines } from "./machines.js";
import { platform } from "./router.js";`,
    declarations: `${columnsCode}

${nameMachineCode}`,
    location: "createPlatformLocation(platform)",
    store: true,
    query: "page=1&size=5",
    render: `<DataViews provider={provider}>
  <DataViews.SavedViews />
  <DataViews.Search label="Search machines" />
  <DataViews.Filters labels={{ status: "Status", cores: "Cores", name: "Host", region: "Region", owner: "Owner" }} />
  <DataViews.DataTable
    columns={columns}
    label="Machines"
    selectable
    getRowLabel={nameMachine}
  />
  <DataViews.ActionBar />
  <DataViews.Pagination sizes={[5, 10, 25]} />
</DataViews>`,
  }),
  render: function RenderConnectedParts(args) {
    // A memory location and a story's own store stand in for the browser's
    // here, so the story never rewrites the page's own address or its views.
    const [location] = useState(() =>
      createMemoryLocation({ href: "/machines" }),
    );
    const { store } = useStoryViewStore({ seed: [failedMachines] });
    const provider = useMachineProvider({
      query: "page=1&size=5",
      prepare: selectTwo,
      location,
      views: store,
    });
    return <Collection provider={provider} {...pickStoryWords(args)} />;
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(getSummary(canvas)).toHaveTextContent(
        "Showing 1–5 out of 12 rows",
      ),
    );
    await expect(
      canvas.getByRole("group", { name: "Selection actions" }),
    ).toHaveTextContent("2 selected");
    await expect(
      canvas.getByRole("group", { name: "Saved views" }),
    ).toBeVisible();
  },
};

/** The code the stories of a query in the URL show. */
const queryInTheUrlCode = showConsumerCode({
  parts: ["DataViews", "createColumns"],
  core: ["createPlatformLocation"],
  imports: `import { type Machine, machineCollection, machines } from "./machines.js";
import { platform } from "./router.js";`,
  declarations: `${columnsCode}

${nameMachineCode}`,
  // The router's platform surface: anything with getLocation, navigate
  // and subscribe. The provider adopts the query it carries and writes
  // every edit back.
  location: "createPlatformLocation(platform)",
  render: `<DataViews provider={provider}>
  <DataViews.Search label="Search machines" />
  <DataViews.Filters labels={{ status: "Status", cores: "Cores", name: "Host", region: "Region", owner: "Owner" }} />
  <DataViews.DataTable
    columns={columns}
    label="Machines"
    selectable
    getRowLabel={nameMachine}
  />
  <DataViews.ActionBar />
  <DataViews.Pagination sizes={[5, 10, 25]} />
</DataViews>`,
});

/**
 * The query in the URL: the location arrived carrying `status=failed`, so
 * the provider adopted it, and running machines were then added in the
 * filters, which wrote the query back to the location as a history entry —
 * a filter is a step Back returns from, while typing in the search replaces
 * the entry. A link carrying a clause the source refuses stays in the URL,
 * and the filters list it with its reasons.
 */
export const QueryInTheUrl: Story = {
  name: "Query in the URL",
  parameters: queryInTheUrlCode,
  render: function RenderQueryInTheUrl(args) {
    // A memory location stands in for the browser's here, so the story
    // never rewrites the page's own address.
    const [location] = useState(() =>
      createMemoryLocation({ href: "/machines?status=failed" }),
    );
    const provider = useMachineProvider({
      query: "page=1&size=5",
      location,
    });
    return (
      <Collection provider={provider} {...pickStoryWords(args)}>
        <QueryInTheLocation location={location} />
      </Collection>
    );
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("checkbox", { name: "failed" })).toBeChecked(),
    );
    await waitFor(() =>
      expect(getSummary(canvas)).toHaveTextContent("Showing 1–3 out of 3 rows"),
    );
    // An edit the filters make is written back to the location.
    await userEvent.click(canvas.getByRole("checkbox", { name: "running" }));
    await waitFor(() =>
      expect(canvas.getByLabelText("Location")).toHaveTextContent(
        /status=failed.*status=running|status=running.*status=failed/,
      ),
    );
    await waitFor(() =>
      // The location carried no page size, so the default page holds all
      // nine.
      expect(getSummary(canvas)).toHaveTextContent("Showing 1–9 out of 9 rows"),
    );
  },
};

/**
 * A link with a refused filter: the link carried `status=melted`, which is no
 * status a machine has. Leaving it out would show every machine, wider than
 * the link asked for, so nothing runs: the table says the link could not be
 * followed and why, and the filters list the clause with a Clear control.
 * Clearing it removes the clause from the URL, and the query runs over all
 * twelve machines.
 */
export const LinkWithARefusedFilter: Story = {
  name: "Link with a refused filter",
  parameters: queryInTheUrlCode,
  render: function RenderLinkWithARefusedFilter(args) {
    const [location] = useState(() =>
      createMemoryLocation({ href: "/machines?status=melted" }),
    );
    const provider = useMachineProvider({ query: "page=1&size=5", location });
    return (
      <Collection provider={provider} {...pickStoryWords(args)}>
        <QueryInTheLocation location={location} />
      </Collection>
    );
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(
        'This link could not be followed: "melted" is not an option of "status".',
      ),
    ).toBeInTheDocument();
    const refusals = canvas.getByRole("list", {
      name: "Not applied from the link",
    });
    await expect(
      within(refusals).getByRole("button", { name: "Clear Status" }),
    ).toBeInTheDocument();
    // Nothing ran, and the link stands in the URL until it is cleared.
    await expect(canvas.getByLabelText("Location")).toHaveTextContent(
      "status=melted",
    );
  },
};

/**
 * A link with a refused sort: the link asked to order by a field the machines
 * do not have. An ordering narrows nothing, so the rows come in the source's
 * own order and the filters list the refused sort, with nothing to clear.
 */
export const LinkWithARefusedSort: Story = {
  name: "Link with a refused sort",
  parameters: queryInTheUrlCode,
  render: function RenderLinkWithARefusedSort(args) {
    const [location] = useState(() =>
      createMemoryLocation({ href: "/machines?sort=colour__asc" }),
    );
    const provider = useMachineProvider({ query: "page=1&size=5", location });
    return (
      <Collection provider={provider} {...pickStoryWords(args)}>
        <QueryInTheLocation location={location} />
      </Collection>
    );
  },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(getSummary(canvas)).toHaveTextContent(
        "Showing 1–12 out of 12 rows",
      ),
    );
    const refusals = canvas.getByRole("list", {
      name: "Not applied from the link",
    });
    await expect(refusals).toHaveTextContent(
      'Sort: "colour" is not a field of this collection.',
    );
    await expect(within(refusals).queryByRole("button")).toBeNull();
  },
};
