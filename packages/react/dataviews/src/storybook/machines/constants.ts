/**
 * What the server-backed stories share: the columns their screen renders,
 * the names and page sizes of its parts, and the source text of those
 * columns and of the composition, for their "Show code" panels. The text is
 * written from the columns and parts it spells. Each stories file adds the
 * source its endpoint is reached through.
 */

import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";
import { machineCollection } from "./fixtures.js";

/** The machine columns as declared, which the columns and their text are written from. */
const SERVER_BACKED_DECLARATIONS = [
  { field: "name", header: "Host", sortable: true },
  { field: "status", header: "Status", sortable: true },
  { field: "cores", header: "Cores", sortable: true },
  { field: "region", header: "Region", sortable: true },
  { field: "owner", header: "Owner", sortable: true },
] as const;

/** The machine columns, each ordered by the header where the source can. */
export const SERVER_BACKED_COLUMNS = createColumns(
  machineCollection,
  SERVER_BACKED_DECLARATIONS,
);

/** The machine columns, as source text written from the columns themselves. */
export const SERVER_BACKED_COLUMNS_CODE = `const columns = createColumns(machineCollection, [
${SERVER_BACKED_DECLARATIONS.map(
  ({ field, header, sortable }) =>
    `  { field: ${JSON.stringify(field)}, header: ${JSON.stringify(header)}, sortable: ${String(sortable)} },`,
).join("\n")}
]);`;

/** The fields whose facets the server-backed screen asks its endpoint for. */
export const SERVER_BACKED_FACETS = ["status", "cores"] as const;

/**
 * What the screen names its parts and fields, and the page sizes it offers:
 * read by the screen and by the source text of its composition alike.
 */
export const SERVER_BACKED_PARTS = {
  searchLabel: "Search machines",
  tableLabel: "Machines",
  labels: {
    status: "Status",
    cores: "Cores",
    name: "Host",
    region: "Region",
    owner: "Owner",
  },
  sizes: [5, 10],
} as const satisfies {
  readonly searchLabel: string;
  readonly tableLabel: string;
  readonly labels: Readonly<Record<string, string>>;
  readonly sizes: readonly number[];
};

/**
 * The composition every server-backed story renders, as JSX source text
 * written from the parts it names.
 */
export const SERVER_BACKED_RENDER_CODE = `<DataViews provider={provider}>
  <DataViews.Search label=${JSON.stringify(SERVER_BACKED_PARTS.searchLabel)} />
  <DataViews.Filters
    labels={{
${Object.entries(SERVER_BACKED_PARTS.labels)
  .map(([field, label]) => `      ${field}: ${JSON.stringify(label)},`)
  .join("\n")}
    }}
  />
  <DataViews.DataTable
    columns={columns}
    label=${JSON.stringify(SERVER_BACKED_PARTS.tableLabel)}
    rowLabel={(row) => String(row["name"])}
    footer={<DataViews.Pagination sizes={[${SERVER_BACKED_PARTS.sizes.join(", ")}]} />}
  />
</DataViews>`;
