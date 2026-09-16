import type {
  Collection,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { readFieldName } from "../../../../utils/index.js";
import type { DataTableColumn } from "../../types.js";

/**
 * The column heading each row, or null where none is declared, read where
 * the table mounts.
 *
 * A row has one name, so two columns declared its header fail here and are
 * both named. A header must name every row, so a column over a field scoped
 * to fewer than every declared type, or narrowed to fewer itself, fails too:
 * its cell in a row of another type would be the not-applicable dash, and
 * the row named by nothing. The one returned reads as never hideable,
 * whatever it declared: hiding the header would take the row's name with it.
 */
export default function readRowHeader(
  columns: readonly DataTableColumn[],
  collection: Pick<
    Collection<readonly SchemaFieldDefinition[]>,
    "schema" | "types"
  >,
): DataTableColumn | null {
  const headers = columns.filter((column) => column.rowHeader === true);
  if (headers.length > 1) {
    const named = headers.map((column) => `"${column.id}"`).join(" and ");
    throw new Error(
      `DataTable columns ${named} are each the row header; a row has one`,
    );
  }
  const header = headers.at(0);
  if (header === undefined) {
    return null;
  }
  const field = readFieldName(header);
  const { schema, types } = collection;
  // A scope naming every declared type leaves no row out; one naming fewer
  // does. A collection of one type has no scope to leave a row out by.
  const leavesOut = (scope: readonly string[] | undefined): boolean =>
    scope !== undefined &&
    types !== null &&
    types.names.some((name) => !scope.includes(name));
  if (
    leavesOut(header.appliesTo) ||
    leavesOut(schema.findField(field)?.appliesTo)
  ) {
    throw new Error(
      `DataTable column "${header.id}" is the row header, but its field "${field}" does not apply to every record type`,
    );
  }
  return { ...header, hideable: false };
}
