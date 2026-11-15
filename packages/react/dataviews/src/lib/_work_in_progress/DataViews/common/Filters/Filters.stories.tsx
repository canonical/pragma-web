import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { renderToString } from "react-dom/server";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { withAppScope } from "../../../../../storybook/decorators.js";
import getHiddenButton from "../../../../../storybook/getHiddenButton.js";
import { consumerCode } from "../../../../../storybook/machines/consumerCode.js";
import createSourceWithoutCores from "../../../../../storybook/machines/createSourceWithoutCores.js";
import {
  spareMachineCollection,
  spareMachines,
} from "../../../../../storybook/machines/fixtures.js";
import type { MachineProviderConfig } from "../../../../../storybook/machines/types.js";
import useMachineProvider from "../../../../../storybook/machines/useMachineProvider.js";
import "../../../../../storybook/noScripts.css";
import { DataTable, type DataTableColumn } from "../../../DataTable/index.js";
import DataViews from "../../Provider.js";
import Component from "./Filters.js";
import type { DataViewsFiltersProps } from "./types.js";

const meta = {
  title: "_work_in_progress/DataViews/Filters",
  component: Component,
  decorators: [withAppScope],
  args: {
    labels: {
      status: "Status",
      cores: "Cores",
      name: "Host",
      region: "Region",
      owner: "Owner",
    },
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof Component>;

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
  { id: "owner", header: "Owner" },
];

const columnsCode = `const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "status", header: "Status" },
  { id: "cores", header: "Cores" },
  { id: "owner", header: "Owner" },
];`;

const composition = `<DataViews provider={provider}>
  <DataViews.Filters labels={{ status: "Status", cores: "Cores", name: "Host", region: "Region", owner: "Owner" }} />
  <DataTable provider={provider} columns={columns} label="Machines" />
</DataViews>`;

const parts = ["DataTable", "DataViews", "type DataTableColumn"];

/** A composed collection: a root, its filters and its table. */
function FilteredMachines({
  options,
  ...args
}: DataViewsFiltersProps & {
  readonly options?: MachineProviderConfig | undefined;
}): ReactElement {
  const provider = useMachineProvider(options);
  return (
    <DataViews provider={provider}>
      <Component {...args} />
      <DataTable provider={provider} columns={columns} label="Machines" />
    </DataViews>
  );
}

const renderWith =
  (options?: MachineProviderConfig): NonNullable<Story["render"]> =>
  (args) => <FilteredMachines {...args} options={options} />;

/** The table's record rows: every row but the header's. */
const recordRows = (canvas: {
  getAllByRole: (role: string) => HTMLElement[];
}) => canvas.getAllByRole("row").length - 1;

/** The query the provider starts on: only failed machines. */
const onlyFailed = "status=failed";

/** The query the provider starts on: machines with at least sixteen cores. */
const atLeastSixteenCores = "cores__gte=16";

/**
 * Default: one control per filterable field in the collection's schema — a
 * checkbox per status, and a from and a to bound for cores. Nothing is
 * applied, so every machine shows.
 */
export const Default: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    render: composition,
  }),
  render: renderWith(),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Filters" })).toBeVisible();
    await waitFor(() => expect(recordRows(canvas)).toBe(12));
    await expect(canvas.getByLabelText("Cores from")).toHaveValue(null);
  },
};

/**
 * A choice applied: the provider started on a query of only failed
 * machines, and the checkbox shows it. The checkbox is the applied query,
 * not a draft of it — there is no second query to apply or keep in step.
 */
export const ChoiceApplied: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    query: onlyFailed,
    render: composition,
  }),
  render: renderWith({ query: onlyFailed }),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "failed" }),
    ).toBeChecked();
    await waitFor(() => expect(recordRows(canvas)).toBe(3));
  },
};

/** A bound applied: machines with at least sixteen cores. */
export const BoundApplied: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    query: atLeastSixteenCores,
    render: composition,
  }),
  render: renderWith({ query: atLeastSixteenCores }),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Cores from")).toHaveValue(16);
    await waitFor(() => expect(recordRows(canvas)).toBe(4));
    // Scripting is enabled here: the clear control the enhancement drives
    // shows, and the baseline's submit control does not.
    await expect(
      canvas.getByRole("button", { name: "Clear Cores from" }),
    ).toBeVisible();
    await expect(getHiddenButton(canvas, "Apply filters")).not.toBeVisible();
  },
};

/** The query the provider starts on: two lower bounds on cores, both in force. */
const twoLowerBounds = "cores__gte=16&cores__gte__1=4";

/**
 * Further restrictions applied: the link holds two lower bounds on cores,
 * and both restrict, so a machine must meet each. The bound's input edits
 * one; the other is shown read-only after it, with a Clear that removes it
 * alone. Without scripting, the Clear is a real link and a hidden input
 * carries the restriction through the form.
 */
export const FurtherConjunctsApplied: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    query: twoLowerBounds,
    render: composition,
  }),
  render: renderWith({ query: twoLowerBounds }),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Cores from")).toHaveValue(16);
    await expect(canvas.getByText("Cores from 4")).toBeVisible();
    await waitFor(() => expect(recordRows(canvas)).toBe(4));
    await userEvent.click(
      canvas.getByRole("button", { name: "Clear Cores from 4" }),
    );
    await expect(canvas.queryByText("Cores from 4")).toBeNull();
    await expect(canvas.getByLabelText("Cores from")).toHaveValue(16);
  },
};

/**
 * An invalid edit keeps the restriction: sixteen cores was applied, then the
 * bound was edited below the schema's minimum of one. The edit is refused
 * by the schema — and, being a native number input carrying that minimum,
 * by the browser too — the sixteen-core restriction stays in force, and the
 * message beside the input says so: the value on screen is not what is
 * filtering the rows.
 */
export const InvalidEditKeepsTheRestriction: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    query: atLeastSixteenCores,
    render: composition,
  }),
  render: renderWith({ query: atLeastSixteenCores }),
  play: async ({ canvas }) => {
    const bound = canvas.getByLabelText<HTMLInputElement>("Cores from");
    await expect(bound).toHaveValue(16);
    await userEvent.clear(bound);
    await userEvent.type(bound, "0");
    await expect(bound).toHaveAttribute("aria-invalid", "true");
    await expect(bound).toHaveAccessibleDescription(
      /The previous restriction still applies\.$/,
    );
    await expect(bound.validity.rangeUnderflow).toBe(true);
    await waitFor(() => expect(recordRows(canvas)).toBe(4));
  },
};

/**
 * A field the source cannot filter: this source declares no filter on
 * cores, so the filters offer none, though the collection has the field. A
 * control for a restriction the source would refuse would be a control that
 * does nothing.
 */
export const UndeclaredField: Story = {
  parameters: consumerCode({
    parts,
    coreTypes: ["Source"],
    imports: `import { type Machine, machineCollection, machines } from "./machines.js";`,
    declarations: `${columnsCode}

// What a source declares is what the filters offer. An endpoint that cannot
// filter or order by cores leaves the field out of its declaration; this
// takes it out of the local source's, which declares every schema field.
const withoutCores = (source: Source<Machine>): Source<Machine> => {
  const { cores: _cores, ...filter } = source.capabilities.filter;
  return {
    ...source,
    capabilities: {
      ...source.capabilities,
      filter,
      sort: {
        ...source.capabilities.sort,
        fields: source.capabilities.sort.fields.filter(
          (field) => field !== "cores",
        ),
      },
    },
  };
};`,
    source: `withoutCores(
  createArraySource({ rows: machines, collection: machineCollection }),
)`,
    render: composition,
  }),
  render: renderWith({ source: createSourceWithoutCores }),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "failed" }),
    ).toBeVisible();
    await expect(canvas.queryByLabelText("Cores from")).toBeNull();
  },
};

/** The fields whose facets the faceted stories ask the source for. */
const facets = ["status", "cores"] as const;

/**
 * Counts beside the options and the range beside the bounds: the provider
 * asks its source for the status and cores facets, which the source computes
 * over every machine the query matches. Each count describes its checkbox,
 * and each end of the range its bound.
 */
export const CountsBesideOptions: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    facets,
    render: composition,
  }),
  render: renderWith({ facets }),
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(
        canvas.getByRole("checkbox", { name: "failed" }),
      ).toHaveAccessibleDescription("3"),
    );
    await expect(
      canvas.getByLabelText("Cores from"),
    ).toHaveAccessibleDescription(/^Lowest: \d+$/);
    await expect(canvas.getByLabelText("Cores to")).toHaveAccessibleDescription(
      /^Highest: \d+$/,
    );
  },
};

/** The query the provider starts on: every machine that is not failed. */
const noneFailed = "status__isNone=failed";

/**
 * None of the chosen statuses: the provider started on every machine that is
 * not failed, shown as the none-of set. It moves back to any-of in one step.
 */
export const NoneOfApplied: Story = {
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    query: noneFailed,
    facets,
    render: composition,
  }),
  render: renderWith({ query: noneFailed, facets }),
  play: async ({ canvas }) => {
    const excluded = canvas.getByRole("group", { name: "Status is none of" });
    await expect(
      within(excluded).getByRole("checkbox", { name: "failed" }),
    ).toBeChecked();
    await waitFor(() => expect(recordRows(canvas)).toBe(9));
    await expect(
      within(excluded).getByRole("button", {
        name: "Match any of these instead",
      }),
    ).toBeVisible();
  },
};

/** What the primary-filters story renders, as source text. */
const primaryComposition = `<DataViews provider={provider}>
  <DataViews.Filters primary={["status"]} labels={{ status: "Status", cores: "Cores", name: "Host", region: "Region", owner: "Owner" }} />
  <DataTable provider={provider} columns={columns} label="Machines" />
</DataViews>`;

/**
 * Primary filters: the status is marked primary, so its control shows by
 * default and the other fields wait under "More filters". Cores carries a
 * restriction — at least sixteen — so its control shows beside the status
 * rather than hiding what filters the rows.
 */
export const PrimaryFilters: Story = {
  args: { primary: ["status"] },
  parameters: consumerCode({
    parts,
    declarations: columnsCode,
    query: atLeastSixteenCores,
    render: primaryComposition,
  }),
  render: renderWith({ query: atLeastSixteenCores }),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "failed" }),
    ).toBeVisible();
    await expect(canvas.getByLabelText("Cores from")).toBeVisible();
    const host = canvas.getByLabelText("Host contains");
    await expect(host).not.toBeVisible();
    await userEvent.click(canvas.getByText("More filters"));
    await waitFor(() => expect(host).toBeVisible());
  },
};

/** The spare machines' columns: the host, its memory and its owner. */
const spareColumns: readonly DataTableColumn[] = [
  { id: "name", header: "Host" },
  { id: "memory", header: "Memory" },
  { id: "owner", header: "Owner" },
];

/** A root over the spare machines, starting on one query. */
function FilteredSpareMachines({
  query,
  ...args
}: DataViewsFiltersProps & { readonly query: string }): ReactElement {
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: spareMachineCollection,
      source: createArraySource({
        rows: spareMachines,
        collection: spareMachineCollection,
      }),
      snapshot: { query, presentation: {} },
    }),
  );
  return (
    <DataViews provider={provider}>
      <Component {...args} />
      <DataTable
        provider={provider}
        columns={spareColumns}
        label="Spare machines"
      />
    </DataViews>
  );
}

/**
 * The query the new operators story starts on: hosts not containing `db`
 * and ending with `.com`, at least 8 GiB of memory, tagged both `ex-gpu`
 * and `ex-nvme`.
 */
const newOperators =
  "name__notContains=db&name__endsWith=.com&memory__gte=8192&tags=ex-gpu&tags__isAny__1=ex-nvme";

/**
 * The operators beyond containing and starting with. A text field matches
 * by the operator chosen beside its input — here, hosts that do not contain
 * `db` and end with `.com`, each with a control of its own. Memory is measured in MiB and typed in MiB or GiB, so `8 GiB` and
 * `8192` are one bound. Tags are a list, so two any-of restrictions ask for
 * both. Presence is filtered either way: Has a value, or Has no value.
 */
export const NewOperators: Story = {
  args: {
    labels: { name: "Host", memory: "Memory", owner: "Owner", tags: "Tags" },
  },
  render: (args) => <FilteredSpareMachines {...args} query={newOperators} />,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Host does not contain" }),
    ).toHaveValue("db");
    await expect(
      canvas
        .getAllByRole("combobox", { name: "How Host matches" })
        .map((select) => (select as HTMLSelectElement).value),
    ).toEqual(["notContains", "endsWith"]);
    await expect(
      canvas.getByRole("textbox", { name: "Memory from (MiB)" }),
    ).toHaveValue("8192");
    await expect(canvas.getByText("Tags is any of ex-nvme")).toBeVisible();
    await waitFor(() => expect(recordRows(canvas)).toBe(1));
    await expect(
      canvas.getByRole("cell", { name: "cache-01.example.com" }),
    ).toBeVisible();
    const owner = within(canvas.getByRole("group", { name: "Owner" }));
    await userEvent.click(owner.getByRole("radio", { name: "Has no value" }));
    // Its one machine has an owner, so none is left.
    await waitFor(() =>
      expect(
        canvas.queryByRole("cell", { name: "cache-01.example.com" }),
      ).toBeNull(),
    );
    await userEvent.click(owner.getByRole("radio", { name: "Any" }));
    await waitFor(() => expect(recordRows(canvas)).toBe(1));
    const memory = canvas.getByRole("textbox", { name: "Memory from (MiB)" });
    await userEvent.clear(memory);
    await userEvent.type(memory, "16 GiB");
    // 16 GiB is 16384 MiB, more than its 8192.
    await waitFor(() =>
      expect(
        canvas.queryByRole("cell", { name: "cache-01.example.com" }),
      ).toBeNull(),
    );
    await userEvent.clear(memory);
    await userEvent.type(memory, "8 GiB");
    await waitFor(() => expect(recordRows(canvas)).toBe(1));
  },
};

/**
 * Presence restricted outside the primary filters: the host is marked
 * primary, so the owner's control shows only because the link restricts
 * it. Arrow keys choose each radio they reach, so moving onto Any removes
 * the restriction; the control stays where it stands while focus is inside
 * it, and moves under More filters once focus leaves.
 */
export const PresenceOutsideThePrimaryFilters: Story = {
  args: {
    primary: ["name"],
    labels: { name: "Host", memory: "Memory", owner: "Owner", tags: "Tags" },
  },
  render: (args) => (
    <FilteredSpareMachines {...args} query="owner__isSet=true" />
  ),
  play: async ({ canvas }) => {
    const owner = canvas.getByRole("group", { name: "Owner" });
    await expect(
      within(owner).getByRole("radio", { name: "Has a value" }),
    ).toBeChecked();
    await waitFor(() => expect(recordRows(canvas)).toBe(3));
  },
};

/** The spare machines' filters as a server renders them, never hydrated. */
function ServerRenderedSpareFilters({
  query,
  ...args
}: DataViewsFiltersProps & { readonly query: string }): ReactElement {
  const [markup] = useState(() => {
    const provider = createDataViewsProvider({
      collection: spareMachineCollection,
      source: createArraySource({
        rows: spareMachines,
        collection: spareMachineCollection,
      }),
      snapshot: { query, presentation: {} },
    });
    return renderToString(
      <DataViews provider={provider}>
        <Component {...args} />
      </DataViews>,
    );
  });
  // Shown as a page with scripting disabled shows it: the enhancement's
  // controls hidden, the baseline's submit shown.
  return (
    <div
      className="no-scripts"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the story shows the server's own markup, before any script takes it over
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

/** The query the no-JavaScript story starts on: a clause on each new operator. */
const newOperatorsWithoutScripts =
  "name__notContains=db&owner__isSet=false&memory__gte=8+GiB&tags=ex-gpu&tags__isAny__1=ex-nvme";

/**
 * Before any script runs, under the memory default: the server's markup of
 * the new controls, never hydrated. Each shows the state the provider
 * started on — the text the host must not contain, Has no value chosen,
 * the bound read in MiB, the second tag read-only after the set — and none
 * offers what needs a script: there is no select of how text matches and
 * no Clear button, the form's Apply filters submits it, and, with no
 * location to lead to, the further tag has no Clear link. The page is shown
 * as one with scripting disabled shows it.
 */
export const NoJavaScriptMemoryFilters: Story = {
  name: "No JavaScript, memory: Filters",
  args: {
    labels: { name: "Host", memory: "Memory", owner: "Owner", tags: "Tags" },
  },
  render: (args) => (
    <ServerRenderedSpareFilters {...args} query={newOperatorsWithoutScripts} />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Host does not contain" }),
    ).toHaveValue("db");
    await expect(
      canvas.queryByRole("combobox", { name: "How Host matches" }),
    ).toBeNull();
    await expect(
      canvas.getByRole("radio", { name: "Has no value" }),
    ).toBeChecked();
    await expect(
      canvas.getByRole("textbox", { name: "Memory from (MiB)" }),
    ).toHaveValue("8192");
    await expect(canvas.getByText("Tags is any of ex-nvme")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /^Clear/ })).toBeNull();
    for (const clear of canvas
      .getAllByRole("button", { hidden: true })
      .filter((button) => button.textContent?.startsWith("Clear"))) {
      await expect(clear).not.toBeVisible();
    }
    await expect(
      canvas.getByRole("button", { name: "Apply filters" }),
    ).toBeVisible();
  },
};
